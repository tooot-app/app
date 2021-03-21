import { displayMessage, Message, removeMessage } from '@components/Message'
import { useNetInfo } from '@react-native-community/netinfo'
import {
  NavigationContainer,
  NavigationContainerRef
} from '@react-navigation/native'
import ScreenActions from '@screens/Actions'
import ScreenAnnouncements from '@screens/Announcements'
import ScreenCompose from '@screens/Compose'
import ScreenImagesViewer from '@screens/ImagesViewer'
import ScreenTabs from '@screens/Tabs'
import pushUseConnect from '@utils/push/useConnect'
import pushUseReceive from '@utils/push/useReceive'
import pushUseRespond from '@utils/push/useRespond'
import { updatePreviousTab } from '@utils/slices/contextsSlice'
import { updateAccountPreferences } from '@utils/slices/instances/updateAccountPreferences'
import { getInstanceActive, getInstances } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import { themes } from '@utils/styles/themes'
import * as Analytics from 'expo-firebase-analytics'
import { addScreenshotListener } from 'expo-screen-capture'
import React, { createRef, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Platform, StatusBar } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { onlineManager, useQueryClient } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import * as Sentry from 'sentry-expo'

const Stack = createNativeStackNavigator<Nav.RootStackParamList>()

export interface Props {
  localCorrupt?: string
}

export const navigationRef = createRef<NavigationContainerRef>()

const Screens: React.FC<Props> = ({ localCorrupt }) => {
  const { t } = useTranslation('common')
  const dispatch = useDispatch()
  const instanceActive = useSelector(getInstanceActive)
  const { mode, theme } = useTheme()
  enum barStyle {
    light = 'dark-content',
    dark = 'light-content'
  }

  const routeRef = useRef<{ name?: string; params?: {} }>()

  const isConnected = useNetInfo().isConnected
  useEffect(() => {
    switch (isConnected) {
      case true:
        onlineManager.setOnline(isConnected)
        removeMessage()
        break
      case false:
        onlineManager.setOnline(isConnected)
        displayMessage({
          mode,
          type: 'error',
          message: t('network.disconnected.message'),
          description: t('network.disconnected.description'),
          autoHide: false
        })
        break
    }
  }, [isConnected])

  // Push hooks
  const instances = useSelector(
    getInstances,
    (prev, next) => prev.length === next.length
  )
  const queryClient = useQueryClient()
  pushUseConnect({ navigationRef, mode, t, instances, dispatch })
  pushUseReceive({ navigationRef, queryClient, instances })
  pushUseRespond({ navigationRef, queryClient, instances, dispatch })

  // Prevent screenshot alert
  useEffect(() => {
    const screenshotListener = addScreenshotListener(() =>
      Alert.alert(t('screenshot.title'), t('screenshot.message'), [
        { text: t('screenshot.button'), style: 'destructive' }
      ])
    )
    Platform.select({ ios: screenshotListener })
    return () => screenshotListener.remove()
  }, [])

  // On launch display login credentials corrupt information
  useEffect(() => {
    const showLocalCorrect = () => {
      if (localCorrupt) {
        displayMessage({
          message: t('index.localCorrupt'),
          description: localCorrupt.length ? localCorrupt : undefined,
          type: 'error',
          mode
        })
        navigationRef.current?.navigate('Screen-Tabs', {
          screen: 'Tab-Me'
        })
      }
    }
    return showLocalCorrect()
  }, [localCorrupt])

  // Lazily update users's preferences, for e.g. composing default visibility
  useEffect(() => {
    if (instanceActive !== -1) {
      dispatch(updateAccountPreferences())
    }
  }, [instanceActive])

  // Callbacks
  const navigationContainerOnReady = useCallback(() => {
    const currentRoute = navigationRef.current?.getCurrentRoute()
    routeRef.current = {
      name: currentRoute?.name,
      params: currentRoute?.params
    }
  }, [])
  const navigationContainerOnStateChange = useCallback(() => {
    const previousRoute = routeRef.current
    const currentRoute = navigationRef.current?.getCurrentRoute()

    const matchTabName = currentRoute?.name?.match(/(Tab-.*)-Root/)
    if (matchTabName) {
      //@ts-ignore
      dispatch(updatePreviousTab(matchTabName[1]))
    }

    if (previousRoute?.name !== currentRoute?.name) {
      Analytics.setCurrentScreen(currentRoute?.name)
      Sentry.Native.setContext('page', {
        previous: previousRoute,
        current: currentRoute
      })
    }

    routeRef.current = currentRoute
  }, [])

  return (
    <>
      <StatusBar barStyle={barStyle[mode]} backgroundColor={theme.background} />
      <NavigationContainer
        ref={navigationRef}
        theme={themes[mode]}
        onReady={navigationContainerOnReady}
        onStateChange={navigationContainerOnStateChange}
      >
        <Stack.Navigator initialRouteName='Screen-Tabs'>
          <Stack.Screen
            name='Screen-Tabs'
            component={ScreenTabs}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name='Screen-Actions'
            component={ScreenActions}
            options={{
              stackPresentation: 'transparentModal',
              stackAnimation: 'fade',
              headerShown: false // Android
            }}
          />
          <Stack.Screen
            name='Screen-Announcements'
            component={ScreenAnnouncements}
            options={{
              stackPresentation: 'transparentModal',
              stackAnimation: 'fade',
              headerShown: false // Android
            }}
          />
          <Stack.Screen
            name='Screen-Compose'
            component={ScreenCompose}
            options={{
              stackPresentation: 'fullScreenModal',
              headerShown: false // Android
            }}
          />
          <Stack.Screen
            name='Screen-ImagesViewer'
            component={ScreenImagesViewer}
            options={{
              stackPresentation: 'fullScreenModal',
              stackAnimation: 'fade',
              headerShown: false // Android
            }}
          />
        </Stack.Navigator>

        <Message />
      </NavigationContainer>
    </>
  )
}

export default React.memo(Screens, () => true)
function toast (arg0: { type: string; content: string; autoHide: boolean }) {
  throw new Error('Function not implemented.')
}
