import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import i18n from '@root/i18n/i18n'
import Screens from '@root/Screens'
import audio from '@root/startup/audio'
import dev from '@root/startup/dev'
import log from '@root/startup/log'
import netInfo from '@root/startup/netInfo'
import sentry from '@root/startup/sentry'
import { persistor, store } from '@root/store'
import AccessibilityManager from '@utils/accessibility/AccessibilityManager'
import { getSettingsLanguage } from '@utils/slices/settingsSlice'
import ThemeManager from '@utils/styles/ThemeManager'
import * as Notifications from 'expo-notifications'
import * as SplashScreen from 'expo-splash-screen'
import React, { useCallback, useEffect, useState } from 'react'
import { AppState, LogBox, Platform } from 'react-native'
import { enableScreens } from 'react-native-screens'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import push from './startup/push'

Platform.select({
  android: LogBox.ignoreLogs(['Setting a timer for a long period of time'])
})

dev()
sentry()
audio()
push()

log('log', 'react-query', 'initializing')
export const queryClient = new QueryClient()

log('log', 'react-native-screens', 'initializing')
enableScreens()

const App: React.FC = () => {
  log('log', 'App', 'rendering App')
  const [localCorrupt, setLocalCorrupt] = useState<string>()

  const appStateEffect = useCallback(() => {
    Notifications.setBadgeCountAsync(0)
    Notifications.dismissAllNotificationsAsync()
  }, [])
  useEffect(() => {
    AppState.addEventListener('change', appStateEffect)

    return () => {
      AppState.removeEventListener('change', appStateEffect)
    }
  }, [])

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
        i18n.changeLanguage(language)
        return (
          <ActionSheetProvider>
            <AccessibilityManager>
              <ThemeManager>
                <Screens localCorrupt={localCorrupt} />
              </ThemeManager>
            </AccessibilityManager>
          </ActionSheetProvider>
        )
      } else {
        return null
      }
    },
    [localCorrupt]
  )

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate
          persistor={persistor}
          onBeforeLift={onBeforeLift}
          children={children}
        />
      </Provider>
    </QueryClientProvider>
  )
}

export default React.memo(App, () => true)
