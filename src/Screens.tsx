import { toast, toastConfig } from '@components/toast'
import {
  NavigationContainer,
  NavigationContainerRef
} from '@react-navigation/native'
import ScreenActions from '@screens/Actions'
import ScreenAnnouncements from '@screens/Announcements'
import ScreenCompose from '@screens/Compose'
import ScreenImagesViewer from '@screens/ImagesViewer'
import ScreenTabs from '@screens/Tabs'
import { useAnnouncementQuery } from '@utils/queryHooks/announcement'
import { updatePreviousTab } from '@utils/slices/contextsSlice'
import { updateAccountPreferences } from '@utils/slices/instances/updateAccountPreferences'
import { getInstanceActive } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import { themes } from '@utils/styles/themes'
import * as Analytics from 'expo-firebase-analytics'
import * as Notifications from 'expo-notifications'
import { addScreenshotListener } from 'expo-screen-capture'
import React, { createRef, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Linking, Platform, StatusBar } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import Toast from 'react-native-toast-message'
import { useDispatch, useSelector } from 'react-redux'
import * as Sentry from 'sentry-expo'

const Stack = createNativeStackNavigator<Nav.RootStackParamList>()

const linking = {
  prefixes: ['tooot://', 'https://tooot.app'],
  config: {
    screens: {
      'Screen-Tabs': {
        screens: {
          'Tab-Notifications': 'push/:id'
        }
      }
    }
  },
  subscribe (listener: (arg0: string) => any) {
    const onReceiveURL = ({ url }: { url: string }) => listener(url)
    Linking.addEventListener('url', onReceiveURL)
    const subscription = Notifications.addNotificationResponseReceivedListener(
      response => {
        const url = response.notification.request.content.data.url
        console.log(url)
        url && typeof url === 'string' && listener(url)
      }
    )

    return () => {
      Linking.removeEventListener('url', onReceiveURL)
      subscription.remove()
    }
  }
}

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

  const routeNameRef = useRef<string | undefined>()

  // const isConnected = useNetInfo().isConnected
  // const [firstRender, setFirstRender] = useState(false)
  // useEffect(() => {
  //   if (firstRender) {
  //     // bug in netInfo on first render as false
  //     if (isConnected !== false) {
  //       toast({ type: 'error', content: '手机🈚️网络', autoHide: false })
  //     }
  //   } else {
  //     setFirstRender(true)
  //   }
  // }, [isConnected, firstRender])

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
        toast({
          type: 'error',
          message: t('index.localCorrupt'),
          description: localCorrupt.length ? localCorrupt : undefined,
          autoHide: false
        })
        navigationRef.current?.navigate('Screen-Tabs', {
          screen: 'Tab-Me'
        })
      }
    }
    return showLocalCorrect()
  }, [localCorrupt])

  // On launch check if there is any unread announcements
  useAnnouncementQuery({
    showAll: false,
    options: {
      notifyOnChangeProps: [],
      select: announcements =>
        announcements.filter(announcement => !announcement.read),
      onSuccess: data => {
        if (data.length) {
          navigationRef.current?.navigate('Screen-Announcements', {
            showAll: false
          })
        }
      }
    }
  })

  // Lazily update users's preferences, for e.g. composing default visibility
  useEffect(() => {
    if (instanceActive !== -1) {
      dispatch(updateAccountPreferences())
    }
  }, [instanceActive])

  // Callbacks
  const navigationContainerOnReady = useCallback(
    () =>
      (routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name),
    []
  )
  const navigationContainerOnStateChange = useCallback(() => {
    const previousRouteName = routeNameRef.current
    const currentRouteName = navigationRef.current?.getCurrentRoute()?.name

    const matchTabName = currentRouteName?.match(/(Tab-.*)-Root/)
    if (matchTabName) {
      //@ts-ignore
      dispatch(updatePreviousTab(matchTabName[1]))
    }

    if (previousRouteName !== currentRouteName) {
      Analytics.setCurrentScreen(currentRouteName)
      Sentry.Native.setContext('page', {
        previous: previousRouteName,
        current: currentRouteName
      })
    }

    routeNameRef.current = currentRouteName
  }, [])

  return (
    <>
      <StatusBar barStyle={barStyle[mode]} backgroundColor={theme.background} />
      <NavigationContainer
        ref={navigationRef}
        theme={themes[mode]}
        onReady={navigationContainerOnReady}
        onStateChange={navigationContainerOnStateChange}
        linking={linking}
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

        {Platform.select({
          ios: <Toast ref={Toast.setRef} config={toastConfig} />
        })}
      </NavigationContainer>
    </>
  )
}

export default React.memo(Screens, () => true)
