import { HeaderLeft, HeaderRight } from '@components/Header'
import haptics from '@root/components/haptics'
import { store } from '@root/store'
import formatText from '@screens/Shared/Compose/formatText'
import ComposeRoot from '@screens/Shared/Compose/Root'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { updateStoreReview } from '@utils/slices/contextsSlice'
import { getLocalAccount } from '@utils/slices/instancesSlice'
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
import { useDispatch } from 'react-redux'
import ComposeEditAttachment from './Compose/EditAttachment'
import ComposeContext from './Compose/utils/createContext'
import composeInitialState from './Compose/utils/initialState'
import composeParseState from './Compose/utils/parseState'
import composePost from './Compose/utils/post'
import composeReducer from './Compose/utils/reducer'
import { SharedComposeProp } from './sharedScreens'

const Stack = createNativeStackNavigator()

const Compose: React.FC<SharedComposeProp> = ({
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
        const actualStatus =
          params.incomingStatus.reblog || params.incomingStatus
        formatText({
          textInput: 'text',
          composeDispatch,
          content: `@${actualStatus.account.acct} `,
          disableDebounce: true
        })
        break
      case 'conversation':
        formatText({
          textInput: 'text',
          composeDispatch,
          content: `@${params.incomingStatus.account.acct} `,
          disableDebounce: true
        })
        break
    }
  }, [params?.type])

  const totalTextCount =
    (composeState.spoiler.active ? composeState.spoiler.count : 0) +
    composeState.text.count

  const headerLeft = useCallback(
    () => (
      <HeaderLeft
        type='text'
        content={t('heading.left.button')}
        onPress={() => {
          if (
            totalTextCount === 0 &&
            composeState.attachments.uploads.length === 0 &&
            composeState.poll.active === false
          ) {
            navigation.goBack()
            return
          } else {
            Alert.alert(t('heading.left.alert.title'), undefined, [
              {
                text: t('heading.left.alert.buttons.exit'),
                style: 'destructive',
                onPress: () => navigation.goBack()
              },
              {
                text: t('heading.left.alert.buttons.continue'),
                style: 'cancel'
              }
            ])
          }
        }}
      />
    ),
    [totalTextCount]
  )
  const headerCenter = useCallback(
    () => (
      <Text
        style={[
          styles.count,
          {
            color: totalTextCount > 500 ? theme.red : theme.secondary
          }
        ]}
      >
        {totalTextCount} / 500
      </Text>
    ),
    [totalTextCount]
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

              if (params?.queryKey && params.queryKey[1].page === 'Toot') {
                queryClient.invalidateQueries(params.queryKey)
              }
              navigation.goBack()
            })
            .catch(() => {
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
        disabled={composeState.text.raw.length < 1 || totalTextCount > 500}
      />
    ),
    [totalTextCount, composeState]
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        style={{ flex: 1 }}
        edges={hasKeyboard ? ['left', 'right'] : ['left', 'right', 'bottom']}
      >
        <ComposeContext.Provider value={{ composeState, composeDispatch }}>
          <Stack.Navigator screenOptions={{ headerTopInsetEnabled: false }}>
            <Stack.Screen
              name='Screen-Shared-Compose-Root'
              component={ComposeRoot}
              options={{ headerLeft, headerCenter, headerRight }}
            />
            <Stack.Screen
              name='Screen-Shared-Compose-EditAttachment'
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
  count: {
    textAlign: 'center',
    ...StyleConstants.FontStyle.M
  }
})

export default Compose
