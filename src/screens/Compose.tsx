import analytics from '@components/analytics'
import { HeaderLeft, HeaderRight } from '@components/Header'
import { StackScreenProps } from '@react-navigation/stack'
import haptics from '@root/components/haptics'
import { store } from '@root/store'
import formatText from '@screens/Compose/formatText'
import ComposeRoot from '@screens/Compose/Root'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { updateStoreReview } from '@utils/slices/contextsSlice'
import {
  getLocalAccount,
  getLocalMaxTootChar
} from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { useQueryClient } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import * as Sentry from 'sentry-expo'
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
  const { t } = useTranslation('sharedCompose')
  const { theme } = useTheme()
  const queryClient = useQueryClient()

  const [hasKeyboard, setHasKeyboard] = useState(false)
  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', _keyboardDidShow)
    Keyboard.addListener('keyboardWillHide', _keyboardDidHide)

    // cleanup function
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

  const localAccount = getLocalAccount(store.getState())
  const [composeState, composeDispatch] = useReducer(
    composeReducer,
    params
      ? composeParseState(params)
      : {
          ...composeInitialState,
          visibility:
            localAccount?.preferences &&
            localAccount.preferences['posting:default:visibility']
              ? localAccount.preferences['posting:default:visibility']
              : 'public'
        }
  )

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

  const maxTootChars = useSelector(getLocalMaxTootChar)
  const totalTextCount =
    (composeState.spoiler.active ? composeState.spoiler.count : 0) +
    composeState.text.count

  const headerLeft = useCallback(
    () => (
      <HeaderLeft
        type='text'
        content={t('heading.left.button')}
        onPress={() => {
          analytics('compose_header_back_press')
          if (
            totalTextCount === 0 &&
            composeState.attachments.uploads.length === 0 &&
            composeState.poll.active === false
          ) {
            analytics('compose_header_back_empty')
            navigation.goBack()
            return
          } else {
            analytics('compose_header_back_state_occupied')
            Alert.alert(t('heading.left.alert.title'), undefined, [
              {
                text: t('heading.left.alert.buttons.exit'),
                style: 'destructive',
                onPress: () => {
                  analytics('compose_header_back_occupied_confirm')
                  navigation.goBack()
                }
              },
              {
                text: t('heading.left.alert.buttons.continue'),
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
    [totalTextCount, composeState]
  )
  const headerCenter = useCallback(
    () => (
      <Text
        style={[
          styles.count,
          {
            color: totalTextCount > maxTootChars ? theme.red : theme.secondary
          }
        ]}
      >
        {totalTextCount} / {maxTootChars}
      </Text>
    ),
    [totalTextCount, maxTootChars]
  )
  const dispatch = useDispatch()
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
              dispatch(updateStoreReview(1))
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
              navigation.goBack()
            })
            .catch(error => {
              Sentry.Native.captureException(error)
              haptics('Error')
              composeDispatch({ type: 'posting', payload: false })
              Alert.alert(t('heading.right.alert.title'), undefined, [
                {
                  text: t('heading.right.alert.button')
                }
              ])
            })
        }}
        loading={composeState.posting}
        disabled={
          composeState.text.raw.length < 1 ||
          totalTextCount > maxTootChars ||
          (composeState.attachments.uploads.length > 0 &&
            composeState.attachments.uploads.filter(upload => upload.uploading)
              .length > 0)
        }
      />
    ),
    [totalTextCount, maxTootChars, composeState]
  )

  return (
    <KeyboardAvoidingView
      style={styles.base}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? 23 : 0}
    >
      <SafeAreaView
        style={styles.base}
        edges={hasKeyboard ? ['top'] : ['top', 'bottom']}
      >
        <ComposeContext.Provider value={{ composeState, composeDispatch }}>
          <Stack.Navigator
            screenOptions={{ headerTopInsetEnabled: false }}
            initialRouteName='Screen-Compose-Root'
          >
            <Stack.Screen
              name='Screen-Compose-Root'
              component={ComposeRoot}
              options={{ headerLeft, headerCenter, headerRight }}
            />
            <Stack.Screen
              name='Screen-Compose-EditAttachment'
              component={ComposeEditAttachment}
              options={{ stackPresentation: 'modal', headerShown: false }}
            />
          </Stack.Navigator>
        </ComposeContext.Provider>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  base: { flex: 1 },
  count: {
    textAlign: 'center',
    ...StyleConstants.FontStyle.M
  }
})

export default ScreenCompose
