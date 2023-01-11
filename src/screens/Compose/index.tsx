import { ComponentEmojis } from '@components/Emojis'
import { EmojisState } from '@components/Emojis/Context'
import haptics from '@components/haptics'
import { HeaderLeft, HeaderRight } from '@components/Header'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ComposeRoot from '@screens/Compose/Root'
import { formatText } from '@screens/Compose/utils/processText'
import { useQueryClient } from '@tanstack/react-query'
import { handleError } from '@utils/api/helpers'
import { RootStackScreenProps } from '@utils/navigation/navigators'
import { useInstanceQuery } from '@utils/queryHooks/instance'
import { usePreferencesQuery } from '@utils/queryHooks/preferences'
import { searchLocalStatus } from '@utils/queryHooks/search'
import { useTimelineMutation } from '@utils/queryHooks/timeline'
import {
  getAccountStorage,
  getGlobalStorage,
  setAccountStorage,
  setGlobalStorage
} from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as StoreReview from 'expo-store-review'
import { filter } from 'lodash'
import React, { useEffect, useMemo, useReducer, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Keyboard, Platform } from 'react-native'
import ComposeDraftsList, { removeDraft } from './DraftsList'
import ComposeEditAttachment from './EditAttachment'
import { uploadAttachment } from './Root/Footer/addAttachment'
import ComposeContext from './utils/createContext'
import composeInitialState from './utils/initialState'
import composeParseState from './utils/parseState'
import composePost from './utils/post'
import composeReducer from './utils/reducer'

const Stack = createNativeStackNavigator()

const ScreenCompose: React.FC<RootStackScreenProps<'Screen-Compose'>> = ({
  route: { params },
  navigation
}) => {
  const { t } = useTranslation(['common', 'screenCompose'])
  const { colors } = useTheme()
  const queryClient = useQueryClient()

  const [hasKeyboard, setHasKeyboard] = useState(false)
  useEffect(() => {
    const keyboardShown = Keyboard.addListener('keyboardWillShow', () => setHasKeyboard(true))
    const keyboardHidden = Keyboard.addListener('keyboardWillHide', () => setHasKeyboard(false))

    return () => {
      keyboardShown.remove()
      keyboardHidden.remove()
    }
  }, [])

  const { data: preferences } = usePreferencesQuery()

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
            preferences?.['posting:default:sensitive'] !== undefined
              ? preferences['posting:default:sensitive']
              : false
        },
        visibility: preferences?.['posting:default:visibility'] || 'public'
      }
    }
  }, [])

  const [composeState, composeDispatch] = useReducer(composeReducer, initialReducerState)

  const { data: dataInstance } = useInstanceQuery()
  const maxTootChars = dataInstance?.configuration?.statuses.max_characters || 500
  const totalTextCount =
    (composeState.spoiler.active ? composeState.spoiler.count : 0) + composeState.text.count

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
      case 'share':
        if (params.text) {
          formatText({
            textInput: 'text',
            composeDispatch,
            content: params.text,
            disableDebounce: true
          })
        }
        if (params.media?.length) {
          for (const m of params.media) {
            uploadAttachment({
              composeDispatch,
              media: { uri: m.uri, fileName: 'temp.jpg', type: m.mime }
            })
          }
        }
        break
      case 'edit':
      case 'deleteEdit':
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
        const actualStatus = params.incomingStatus.reblog || params.incomingStatus
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
        searchLocalStatus(params.incomingStatus.uri).then(status => {
          if (status?.uri === params.incomingStatus.uri) {
            composeDispatch({ type: 'updateReply', payload: status })
          }
        })
        break
      case 'conversation':
        formatText({
          textInput: 'text',
          composeDispatch,
          content:
            (params.text ? `${params.text}\n` : '') +
            params.accts.map(acct => `@${acct}`).join(' ') +
            ' ',
          disableDebounce: true
        })
        break
    }
  }, [params?.type])

  const saveDraft = () => {
    const payload = {
      timestamp: composeState.timestamp,
      spoiler: composeState.spoiler.raw,
      text: composeState.text.raw,
      poll: composeState.poll,
      attachments: composeState.attachments,
      visibility: composeState.visibility,
      visibilityLock: composeState.visibilityLock,
      replyToStatus: composeState.replyToStatus
    }

    const currentDrafts = getAccountStorage.object('drafts') || []
    const draftIndex = currentDrafts?.findIndex(
      ({ timestamp }) => timestamp === composeState.timestamp
    )
    if (draftIndex === -1) {
      currentDrafts?.unshift(payload)
    } else {
      currentDrafts[draftIndex] = payload
    }
    setAccountStorage([{ key: 'drafts', value: currentDrafts }])
  }
  useEffect(() => {
    const autoSave = composeState.dirty
      ? setInterval(() => {
          saveDraft()
        }, 1000)
      : removeDraft(composeState.timestamp)
    return () => (autoSave ? clearInterval(autoSave) : undefined)
  }, [composeState])

  const headerRightDisabled = () => {
    if (totalTextCount > maxTootChars) {
      return true
    }
    if (composeState.attachments.uploads.filter(upload => upload.uploading).length > 0) {
      return true
    }
    if (composeState.attachments.uploads.length === 0 && composeState.text.raw.length === 0) {
      return true
    }
    return false
  }
  const mutateTimeline = useTimelineMutation({ onMutate: true })

  const inputProps: EmojisState['inputProps'] = [
    {
      value: [
        composeState.text.raw,
        content => {
          formatText({ textInput: 'text', composeDispatch, content })
        }
      ],
      selection: [
        composeState.text.selection,
        selection => composeDispatch({ type: 'text', payload: { selection } })
      ],
      isFocused: composeState.textInputFocus.isFocused.text,
      maxLength: maxTootChars - (composeState.spoiler.active ? composeState.spoiler.count : 0),
      ref: composeState.textInputFocus.refs.text
    },
    {
      value: [
        composeState.spoiler.raw,
        content => formatText({ textInput: 'spoiler', composeDispatch, content })
      ],
      selection: [
        composeState.spoiler.selection,
        selection => composeDispatch({ type: 'spoiler', payload: { selection } })
      ],
      isFocused: composeState.textInputFocus.isFocused.spoiler,
      maxLength: maxTootChars - composeState.text.count,
      ref: composeState.textInputFocus.refs.spoiler
    }
  ]

  return (
    <ComponentEmojis
      inputProps={inputProps}
      customButton
      customBehavior={Platform.OS === 'ios' ? 'padding' : undefined}
      customEdges={hasKeyboard ? ['top'] : ['top', 'bottom']}
    >
      <ComposeContext.Provider value={{ composeState, composeDispatch }}>
        <Stack.Navigator initialRouteName='Screen-Compose-Root'>
          <Stack.Screen
            name='Screen-Compose-Root'
            component={ComposeRoot}
            options={{
              title: `${totalTextCount} / ${maxTootChars}`,
              headerTitleStyle: {
                fontWeight:
                  totalTextCount > maxTootChars
                    ? StyleConstants.Font.Weight.Bold
                    : StyleConstants.Font.Weight.Normal,
                fontSize: StyleConstants.Font.Size.M
              },
              headerTintColor: totalTextCount > maxTootChars ? colors.red : colors.secondary,
              headerLeft: () => (
                <HeaderLeft
                  type='text'
                  content={t('common:buttons.cancel')}
                  onPress={() => {
                    if (!composeState.dirty) {
                      navigation.goBack()
                      return
                    } else {
                      Alert.alert(t('screenCompose:heading.left.alert.title'), undefined, [
                        {
                          text: t('screenCompose:heading.left.alert.buttons.delete'),
                          style: 'destructive',
                          onPress: () => {
                            removeDraft(composeState.timestamp)
                            navigation.goBack()
                          }
                        },
                        {
                          text: t('screenCompose:heading.left.alert.buttons.save'),
                          onPress: () => {
                            saveDraft()
                            navigation.goBack()
                          }
                        },
                        {
                          text: t('common:buttons.cancel'),
                          style: 'cancel'
                        }
                      ])
                    }
                  }}
                />
              ),
              headerRight: () => (
                <HeaderRight
                  type='text'
                  content={t(
                    `screenCompose:heading.right.button.${
                      (params?.type &&
                        (params.type === 'conversation'
                          ? params.visibility === 'direct'
                            ? params.type
                            : 'default'
                          : params.type)) ||
                      'default'
                    }`
                  )}
                  onPress={() => {
                    composeDispatch({ type: 'posting', payload: true })

                    composePost(params, composeState)
                      .then(res => {
                        haptics('Success')
                        if (Platform.OS === 'ios' && Platform.constants.osVersion === '13.3') {
                          // https://github.com/tooot-app/app/issues/59
                        } else {
                          const currentCount = getGlobalStorage.number(
                            'app.count_till_store_review'
                          )
                          if (currentCount === 10) {
                            StoreReview?.isAvailableAsync()
                              .then(() => StoreReview.requestReview())
                              .catch(() => {})
                            setGlobalStorage('app.count_till_store_review', (currentCount || 0) + 1)
                          } else {
                            setGlobalStorage('app.count_till_store_review', (currentCount || 0) + 1)
                          }
                        }

                        switch (params?.type) {
                          case 'edit': // doesn't work
                          // mutateTimeline.mutate({
                          //   type: 'editItem',
                          //   status: res,
                          //   navigationState: params.navigationState
                          // })
                          // break
                          case 'deleteEdit':
                            for (const navState of params.navigationState) {
                              navState && queryClient.invalidateQueries(navState)
                            }
                            break
                          case 'conversation':
                          case 'reply':
                            if (params.navigationState) {
                              for (const navState of params.navigationState) {
                                navState &&
                                  navState[1].page !== 'Following' &&
                                  queryClient.invalidateQueries(navState)
                              }
                            }
                            break
                        }
                        removeDraft(composeState.timestamp)
                        navigation.goBack()
                      })
                      .catch(error => {
                        if (error?.removeReply) {
                          Alert.alert(
                            t('screenCompose:heading.right.alert.removeReply.title'),
                            t('screenCompose:heading.right.alert.removeReply.description'),
                            [
                              {
                                text: t('common:buttons.cancel'),
                                onPress: () => {
                                  composeDispatch({ type: 'posting', payload: false })
                                },
                                style: 'destructive'
                              },
                              {
                                text: t('screenCompose:heading.right.alert.removeReply.confirm'),
                                onPress: () => {
                                  composeDispatch({ type: 'removeReply' })
                                  composeDispatch({ type: 'posting', payload: false })
                                },
                                style: 'default'
                              }
                            ]
                          )
                        } else {
                          haptics('Error')
                          handleError({ message: 'Posting error', captureResponse: true })
                          composeDispatch({ type: 'posting', payload: false })
                          Alert.alert(
                            t('screenCompose:heading.right.alert.default.title'),
                            undefined,
                            [{ text: t('screenCompose:heading.right.alert.default.button') }]
                          )
                        }
                      })
                  }}
                  loading={composeState.posting}
                  disabled={headerRightDisabled()}
                />
              )
            }}
          />
          <Stack.Screen
            name='Screen-Compose-DraftsList'
            component={ComposeDraftsList}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name='Screen-Compose-EditAttachment'
            component={ComposeEditAttachment}
            options={{ presentation: 'modal' }}
          />
        </Stack.Navigator>
      </ComposeContext.Provider>
    </ComponentEmojis>
  )
}

export default ScreenCompose
