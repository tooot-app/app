import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import '@formatjs/intl-getcanonicallocales/polyfill'
import '@formatjs/intl-locale/polyfill'
import '@formatjs/intl-pluralrules/polyfill'
import '@formatjs/intl-pluralrules/locale-data/de'
import '@formatjs/intl-pluralrules/locale-data/en'
import '@formatjs/intl-pluralrules/locale-data/ko'
import '@formatjs/intl-pluralrules/locale-data/vi'
import '@formatjs/intl-pluralrules/locale-data/zh'
import '@formatjs/intl-numberformat/polyfill'
import '@formatjs/intl-numberformat/locale-data/de'
import '@formatjs/intl-numberformat/locale-data/en'
import '@formatjs/intl-numberformat/locale-data/ko'
import '@formatjs/intl-numberformat/locale-data/vi'
import '@formatjs/intl-numberformat/locale-data/zh'
import '@formatjs/intl-datetimeformat/polyfill'
import '@formatjs/intl-datetimeformat/locale-data/de'
import '@formatjs/intl-datetimeformat/locale-data/en'
import '@formatjs/intl-datetimeformat/locale-data/ko'
import '@formatjs/intl-datetimeformat/locale-data/vi'
import '@formatjs/intl-datetimeformat/locale-data/zh'
import '@formatjs/intl-datetimeformat/add-all-tz'
import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/locale-data/de'
import '@formatjs/intl-relativetimeformat/locale-data/en'
import '@formatjs/intl-relativetimeformat/locale-data/ko'
import '@formatjs/intl-relativetimeformat/locale-data/vi'
import '@formatjs/intl-relativetimeformat/locale-data/zh'
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
import * as Notifications from 'expo-notifications'
import * as SplashScreen from 'expo-splash-screen'
import React, { useCallback, useEffect, useState } from 'react'
import { AppState, LogBox, Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-image-keyboard'
import { enableFreeze } from 'react-native-screens'
import { QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { IntlProvider } from 'react-intl'

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

  const appStateEffect = useCallback(() => {
    Notifications.setBadgeCountAsync(0)
    Notifications.dismissAllNotificationsAsync()
  }, [])
  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', appStateEffect)

    return () => {
      appStateListener.remove()
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
        if (!language) {
          store.dispatch(changeLanguage('en'))
          i18n.changeLanguage('en')
        } else {
          i18n.changeLanguage(language)
        }

        return (
          <ActionSheetProvider>
            <AccessibilityManager>
              <ThemeManager>
                <IntlProvider locale={language}>
                  <Screens localCorrupt={localCorrupt} />
                </IntlProvider>
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
