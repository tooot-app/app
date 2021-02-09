import client from '@api/client'
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
import {
  getLocalActiveIndex,
  updateLocalAccountPreferences
} from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import { themes } from '@utils/styles/themes'
import * as Analytics from 'expo-firebase-analytics'
// import { addScreenshotListener } from 'expo-screen-capture'
import React, { createRef, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StatusBar } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import Toast from 'react-native-toast-message'
import { useDispatch, useSelector } from 'react-redux'

const Stack = createNativeStackNavigator<Nav.RootStackParamList>()

export interface Props {
  localCorrupt?: string
}

export const navigationRef = createRef<NavigationContainerRef>()

const Screens: React.FC<Props> = ({ localCorrupt }) => {
  const { t } = useTranslation('common')
  const dispatch = useDispatch()
  const localActiveIndex = useSelector(getLocalActiveIndex)
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
  // useEffect(() => {
  //   const screenshotListener = addScreenshotListener(() =>
  //     Alert.alert(t('screenshot.title'), t('screenshot.message'), [
  //       { text: t('screenshot.button'), style: 'destructive' }
  //     ])
  //   )
  //   Platform.OS === 'ios' && screenshotListener
  //   return () => screenshotListener.remove()
  // }, [])

  // On launch display login credentials corrupt information
  useEffect(() => {
    const showLocalCorrect = localCorrupt
      ? toast({
          type: 'error',
          message: t('index.localCorrupt'),
          description: localCorrupt.length ? localCorrupt : undefined,
          autoHide: false
        })
      : undefined
    return showLocalCorrect
  }, [localCorrupt])

  // On launch check if there is any unread announcements
  useEffect(() => {
    localActiveIndex !== null &&
      client<Mastodon.Announcement[]>({
        method: 'get',
        instance: 'local',
        url: `announcements`
      })
        .then(res => {
          if (res?.filter(announcement => !announcement.read).length) {
            navigationRef.current?.navigate('Screen-Announcements', {
              showAll: false
            })
          }
        })
        .catch(() => {})
  }, [])

  // Lazily update users's preferences, for e.g. composing default visibility
  useEffect(() => {
    if (localActiveIndex !== null) {
      dispatch(updateLocalAccountPreferences())
    }
  }, [])

  // Callbacks
  const navigationContainerOnReady = useCallback(
    () =>
      (routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name),
    []
  )
  const navigationContainerOnStateChange = useCallback(() => {
    const previousRouteName = routeNameRef.current
    const currentRouteName = navigationRef.current?.getCurrentRoute()?.name

    if (previousRouteName !== currentRouteName) {
      Analytics.setCurrentScreen(currentRouteName)
    }

    routeNameRef.current = currentRouteName
  }, [])

  return (
    <>
      <StatusBar barStyle={barStyle[mode]} />
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
              stackAnimation: 'fade'
            }}
          />
          <Stack.Screen
            name='Screen-Announcements'
            component={ScreenAnnouncements}
            options={{
              stackPresentation: 'transparentModal',
              stackAnimation: 'fade'
            }}
          />
          <Stack.Screen
            name='Screen-Compose'
            component={ScreenCompose}
            options={{
              stackPresentation: 'fullScreenModal'
            }}
          />
          <Stack.Screen
            name='Screen-ImagesViewer'
            component={ScreenImagesViewer}
            options={{
              stackPresentation: 'fullScreenModal',
              stackAnimation: 'fade'
            }}
          />
        </Stack.Navigator>

        {Platform.OS === 'ios' ? (
          <Toast ref={Toast.setRef} config={toastConfig} />
        ) : null}
      </NavigationContainer>
    </>
  )
}

export default React.memo(Screens, () => true)
