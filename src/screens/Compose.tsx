import analytics from '@components/analytics'
import { HeaderCenter, HeaderLeft, HeaderRight } from '@components/Header'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StackScreenProps } from '@react-navigation/stack'
import haptics from '@root/components/haptics'
import formatText from '@screens/Compose/formatText'
import ComposeRoot from '@screens/Compose/Root'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { updateStoreReview } from '@utils/slices/contextsSlice'
import {
  getInstanceAccount,
  getInstanceMaxTootChar,
  removeInstanceDraft,
  updateInstanceDraft
} from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { filter } from 'lodash'
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQueryClient } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import * as Sentry from 'sentry-expo'
import ComposeDraftsList from './Compose/DraftsList'
import ComposeEditAttachment from './Compose/EditAttachment'
import ComposeContext from './Compose/utils/createContext'
import composeInitialState from './Compose/utils/initialState'
import composeParseState from './Compose/utils/parseState'
import composePost from './Compose/utils/post'
import composeReducer from './Compose/utils/reducer'

export type ScreenComposeProp = StackScreenProps<
  Nav.RootStackParamList,
  'Screen-Compose'
>

const Stack = createNativeStackNavigator()

const ScreenCompose: React.FC<ScreenComposeProp> = ({
  route: { params },
  navigation
}) => {
  const { t } = useTranslation('screenCompose')
  const { theme } = useTheme()
  const queryClient = useQueryClient()

  const [hasKeyboard, setHasKeyboard] = useState(false)
  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', _keyboardDidShow)
    Keyboard.addListener('keyboardWillHide', _keyboardDidHide)

    return () => {
      Keyboard.removeListener('keyboardWillShow', _keyboardDidShow)
      Keyboard.removeListener('keyboardWillHide', _keyboardDidHide)
    }
  }, [])
  const _keyboardDidShow = () => {
    setHasKeyboard(true)
  }
  const _keyboardDidHide = () => {
    setHasKeyboard(false)
  }

  const localAccount = useSelector(getInstanceAccount, (prev, next) =>
    prev?.preferences && next?.preferences
      ? prev?.preferences['posting:default:visibility'] ===
        next?.preferences['posting:default:visibility']
      : true
  )
  const initialReducerState = useMemo(() => {
    if (params) {
      return composeParseState(params)
    } else {
      return {
        ...composeInitialState,
        timestamp: Date.now(),
        attachments: {
          ...composeInitialState.attachments,
          sensitive:
            localAccount?.preferences &&
            localAccount?.preferences['posting:default:sensitive']
              ? localAccount?.preferences['posting:default:sensitive']
              : false
        },
        visibility:
          localAccount?.preferences &&
          localAccount.preferences['posting:default:visibility']
            ? localAccount.preferences['posting:default:visibility']
            : 'public'
      }
    }
  }, [])

  const [composeState, composeDispatch] = useReducer(
    composeReducer,
    initialReducerState
  )

  const maxTootChars = useSelector(getInstanceMaxTootChar, () => true)
  const totalTextCount =
    (composeState.spoiler.active ? composeState.spoiler.count : 0) +
    composeState.text.count

  // If compose state is dirty, then disallow add back drafts
  useEffect(() => {
    composeDispatch({
      type: 'dirty',
      payload:
        totalTextCount !== 0 ||
        composeState.attachments.uploads.length !== 0 ||
        (composeState.poll.active === true &&
          filter(composeState.poll.options, o => {
            return o !== undefined && o.length > 0
          }).length > 0)
    })
  }, [
    totalTextCount,
    composeState.attachments.uploads.length,
    composeState.poll.active,
    composeState.poll.options
  ])

  useEffect(() => {
    switch (params?.type) {
      case 'edit':
        if (params.incomingStatus.spoiler_text) {
          formatText({
            textInput: 'spoiler',
            composeDispatch,
            content: params.incomingStatus.spoiler_text,
            disableDebounce: true
          })
        }
        formatText({
          textInput: 'text',
          composeDispatch,
          content: params.incomingStatus.text!,
          disableDebounce: true
        })
        break
      case 'reply':
        const actualStatus =
          params.incomingStatus.reblog || params.incomingStatus
        if (actualStatus.spoiler_text) {
          formatText({
            textInput: 'spoiler',
            composeDispatch,
            content: actualStatus.spoiler_text,
            disableDebounce: true
          })
        }
        params.accts.length && // When replying to myself only, do not add space or even format text
          formatText({
            textInput: 'text',
            composeDispatch,
            content: params.accts.map(acct => `@${acct}`).join(' ') + ' ',
            disableDebounce: true
          })
        break
      case 'conversation':
        formatText({
          textInput: 'text',
          composeDispatch,
          content: params.accts.map(acct => `@${acct}`).join(' ') + ' ',
          disableDebounce: true
        })
        break
    }
  }, [params?.type])

  const saveDraft = () => {
    dispatch(
      updateInstanceDraft({
        timestamp: composeState.timestamp,
        spoiler: composeState.spoiler.raw,
        text: composeState.text.raw,
        poll: composeState.poll,
        attachments: composeState.attachments,
        visibility: composeState.visibility,
        visibilityLock: composeState.visibilityLock,
        replyToStatus: composeState.replyToStatus
      })
    )
  }
  const removeDraft = useCallback(() => {
    dispatch(removeInstanceDraft(composeState.timestamp))
  }, [composeState.timestamp])
  useEffect(() => {
    const autoSave = composeState.dirty
      ? setInterval(() => {
          saveDraft()
        }, 1000)
      : removeDraft()
    return () => autoSave && clearInterval(autoSave)
  }, [composeState])

  const headerLeft = useCallback(
    () => (
      <HeaderLeft
        type='text'
        content={t('heading.left.button')}
        onPress={() => {
          analytics('compose_header_back_press')
          if (!composeState.dirty) {
            analytics('compose_header_back_empty')
            navigation.goBack()
            return
          } else {
            analytics('compose_header_back_state_occupied')
            Alert.alert(t('heading.left.alert.title'), undefined, [
              {
                text: t('heading.left.alert.buttons.delete'),
                style: 'destructive',
                onPress: () => {
                  analytics('compose_header_back_occupied_save')
                  removeDraft()
                  navigation.goBack()
                }
              },
              {
                text: t('heading.left.alert.buttons.save'),
                onPress: () => {
                  analytics('compose_header_back_occupied_delete')
                  saveDraft()
                  navigation.goBack()
                }
              },
              {
                text: t('heading.left.alert.buttons.cancel'),
                style: 'cancel',
                onPress: () => {
                  analytics('compose_header_back_occupied_cancel')
                }
              }
            ])
          }
        }}
      />
    ),
    [composeState]
  )
  const dispatch = useDispatch()
  const headerRightDisabled = useMemo(() => {
    if (totalTextCount > maxTootChars) {
      return true
    }
    if (
      composeState.attachments.uploads.filter(upload => upload.uploading)
        .length > 0
    ) {
      return true
    }
    if (
      composeState.attachments.uploads.length === 0 &&
      composeState.text.raw.length === 0
    ) {
      return true
    }
    return false
  }, [totalTextCount, composeState.attachments.uploads, composeState.text.raw])
  const headerRight = useCallback(
    () => (
      <HeaderRight
        type='text'
        content={
          params?.type
            ? t(`heading.right.button.${params.type}`)
            : t('heading.right.button.default')
        }
        onPress={() => {
          analytics('compose_header_post_press')
          composeDispatch({ type: 'posting', payload: true })

          composePost(params, composeState)
            .then(() => {
              haptics('Success')
              if (
                Platform.OS === 'ios' &&
                Platform.constants.osVersion === '13.3'
              ) {
                // https://github.com/tooot-app/app/issues/59
              } else {
                dispatch(updateStoreReview(1))
              }
              const queryKey: QueryKeyTimeline = [
                'Timeline',
                { page: 'Following' }
              ]
              queryClient.invalidateQueries(queryKey)

              switch (params?.type) {
                case 'edit':
                case 'reply':
                  if (params?.queryKey && params.queryKey[1].page === 'Toot') {
                    queryClient.invalidateQueries(params.queryKey)
                  }
                  break
              }
              removeDraft()
              navigation.goBack()
            })
            .catch(error => {
              if (error.removeReply) {
                Alert.alert(
                  t('heading.right.alert.removeReply.title'),
                  t('heading.right.alert.removeReply.description'),
                  [
                    {
                      text: t('heading.right.alert.removeReply.cancel'),
                      onPress: () => {
                        composeDispatch({ type: 'posting', payload: false })
                      },
                      style: 'destructive'
                    },
                    {
                      text: t('heading.right.alert.removeReply.confirm'),
                      onPress: () => {
                        composeDispatch({ type: 'removeReply' })
                        composeDispatch({ type: 'posting', payload: false })
                      },
                      style: 'default'
                    }
                  ]
                )
              } else {
                Sentry.Native.captureException(error)
                haptics('Error')
                composeDispatch({ type: 'posting', payload: false })
                Alert.alert(t('heading.right.alert.default.title'), undefined, [
                  {
                    text: t('heading.right.alert.default.button')
                  }
                ])
              }
            })
        }}
        loading={composeState.posting}
        disabled={headerRightDisabled}
      />
    ),
    [totalTextCount, composeState]
  )

  const headerContent = useMemo(() => {
    return `${totalTextCount} / ${maxTootChars}${
      __DEV__ ? ` Dirty: ${composeState.dirty.toString()}` : ''
    }`
  }, [totalTextCount, maxTootChars, composeState.dirty])

  return (
    <KeyboardAvoidingView
      style={styles.base}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView
        style={styles.base}
        edges={hasKeyboard ? ['top'] : ['top', 'bottom']}
      >
        <ComposeContext.Provider value={{ composeState, composeDispatch }}>
          <Stack.Navigator initialRouteName='Screen-Compose-Root'>
            <Stack.Screen
              name='Screen-Compose-Root'
              component={ComposeRoot}
              options={{
                ...Platform.select({
                  ios: {
                    headerTitle: headerContent,
                    headerTitleStyle: {
                      fontWeight:
                        totalTextCount > maxTootChars
                          ? StyleConstants.Font.Weight.Bold
                          : StyleConstants.Font.Weight.Normal,
                      fontSize: StyleConstants.Font.Size.M
                    },
                    headerTintColor:
                      totalTextCount > maxTootChars
                        ? theme.red
                        : theme.secondary
                  },
                  android: {
                    headerCenter: () => <HeaderCenter content={headerContent} />
                  }
                }),
                headerLeft,
                headerRight
              }}
            />
            <Stack.Screen
              name='Screen-Compose-DraftsList'
              component={ComposeDraftsList}
              options={{ headerShown: false, presentation: 'modal' }}
            />
            <Stack.Screen
              name='Screen-Compose-EditAttachment'
              component={ComposeEditAttachment}
              options={{ headerShown: false, presentation: 'modal' }}
            />
          </Stack.Navigator>
        </ComposeContext.Provider>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  base: { flex: 1 }
})

export default ScreenCompose
