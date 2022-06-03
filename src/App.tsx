import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import queryClient from '@helpers/queryClient'
import i18n from '@root/i18n/i18n'
import Screens from '@root/Screens'
import audio from '@root/startup/audio'
import dev from '@root/startup/dev'
import log from '@root/startup/log'
import netInfo from '@root/startup/netInfo'
import push from '@root/startup/push'
import sentry from '@root/startup/sentry'
import timezone from '@root/startup/timezone'
import { persistor, store } from '@root/store'
import AccessibilityManager from '@utils/accessibility/AccessibilityManager'
import {
  changeLanguage,
  getSettingsLanguage
} from '@utils/slices/settingsSlice'
import ThemeManager from '@utils/styles/ThemeManager'
import 'expo-asset'
import * as SplashScreen from 'expo-splash-screen'
import React, { useCallback, useEffect, useState } from 'react'
import { LogBox, Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-image-keyboard'
import { enableFreeze } from 'react-native-screens'
import { QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import * as Sentry from 'sentry-expo'

Platform.select({
  android: LogBox.ignoreLogs(['Setting a timer for a long period of time'])
})

dev()
sentry()
audio()
push()
timezone()
enableFreeze(true)

const App: React.FC = () => {
  log('log', 'App', 'rendering App')
  const [localCorrupt, setLocalCorrupt] = useState<string>()

  useEffect(() => {
    const delaySplash = async () => {
      log('log', 'App', 'delay splash')
      try {
        await SplashScreen.preventAutoHideAsync()
      } catch (e) {
        console.warn(e)
      }
    }
    delaySplash()
  }, [])

  const onBeforeLift = useCallback(async () => {
    let netInfoRes = undefined
    try {
      netInfoRes = await netInfo()
    } catch {}

    if (netInfoRes && netInfoRes.corrupted && netInfoRes.corrupted.length) {
      setLocalCorrupt(netInfoRes.corrupted)
    }

    log('log', 'App', 'hide splash')
    try {
      await SplashScreen.hideAsync()
      return Promise.resolve()
    } catch (e) {
      console.warn(e)
      return Promise.reject()
    }
  }, [])

  const children = useCallback(
    bootstrapped => {
      log('log', 'App', 'bootstrapped')
      if (bootstrapped) {
        log('log', 'App', 'loading actual app :)')
        const language = getSettingsLanguage(store.getState())
        if (!language) {
          store.dispatch(changeLanguage('en'))
          i18n.changeLanguage('en')
        } else {
          i18n.changeLanguage(language)
        }

        return (
          <Sentry.Native.TouchEventBoundary>
            <ActionSheetProvider>
              <AccessibilityManager>
                <ThemeManager>
                  <Screens localCorrupt={localCorrupt} />
                </ThemeManager>
              </AccessibilityManager>
            </ActionSheetProvider>
          </Sentry.Native.TouchEventBoundary>
        )
      } else {
        return null
      }
    },
    [localCorrupt]
  )

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <PersistGate
            persistor={persistor}
            onBeforeLift={onBeforeLift}
            children={children}
          />
        </Provider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}

export default React.memo(App, () => true)
