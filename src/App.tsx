import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import getLanguage from '@helpers/getLanguage'
import queryClient from '@helpers/queryClient'
import i18n from '@root/i18n/i18n'
import Screens from '@root/Screens'
import audio from '@root/startup/audio'
import log from '@root/startup/log'
import netInfo from '@root/startup/netInfo'
import push from '@root/startup/push'
import sentry from '@root/startup/sentry'
import timezone from '@root/startup/timezone'
import { storage } from '@root/store'
import * as Sentry from '@sentry/react-native'
import AccessibilityManager from '@utils/accessibility/AccessibilityManager'
import ThemeManager from '@utils/styles/ThemeManager'
import * as Localization from 'expo-localization'
import * as SplashScreen from 'expo-splash-screen'
import React, { useCallback, useEffect, useState } from 'react'
import { IntlProvider } from 'react-intl'
import { LogBox, Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { enableFreeze } from 'react-native-screens'
import { QueryClientProvider } from '@tanstack/react-query'
import { hasMigratedFromAsyncStorage, migrateFromAsyncStorage } from '@utils/migrations/toMMKV'
import { MMKV } from 'react-native-mmkv'
import { getGlobalStorage, setGlobalStorage } from '@utils/storage/actions'

Platform.select({
  android: LogBox.ignoreLogs(['Setting a timer for a long period of time'])
})

sentry()
audio()
push()
timezone()
enableFreeze(true)

log('log', 'App', 'delay splash')
SplashScreen.preventAutoHideAsync()

const App: React.FC = () => {
  log('log', 'App', 'rendering App')
  const [appIsReady, setAppIsReady] = useState(false)
  const [localCorrupt, setLocalCorrupt] = useState<string>()

  const [hasMigrated, setHasMigrated] = useState(hasMigratedFromAsyncStorage)

  useEffect(() => {
    const prepare = async () => {
      if (!hasMigrated && !hasMigratedFromAsyncStorage) {
        try {
          await migrateFromAsyncStorage()
          setHasMigrated(true)
        } catch (e) {
          // TODO: fall back to AsyncStorage? Wipe storage clean and use MMKV? Crash app?
        }
      } else {
        log('log', 'App', 'loading from MMKV')
        const account = getGlobalStorage.string('account.active')
        if (account) {
          const storageAccount = new MMKV({ id: account })
          const token = storageAccount.getString('auth.token')
          if (token) {
            storage.account = storageAccount
          }
        }
      }

      let netInfoRes = undefined
      try {
        netInfoRes = await netInfo()
      } catch {}

      if (netInfoRes && netInfoRes.corrupted && netInfoRes.corrupted.length) {
        setLocalCorrupt(netInfoRes.corrupted)
      }

      log('log', 'App', `locale: ${Localization.locale}`)
      const language = getLanguage()
      if (!language) {
        if (Platform.OS !== 'ios') {
          setGlobalStorage('app.language', 'en')
        }
        i18n.changeLanguage('en')
      } else {
        i18n.changeLanguage(language)
      }

      setAppIsReady(true)
    }

    prepare()
  }, [])
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      log('log', 'App', 'hide splash')
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])
  if (!appIsReady) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale={getLanguage() || 'en'}>
          <SafeAreaProvider>
            <ActionSheetProvider>
              <AccessibilityManager>
                <ThemeManager>
                  <Screens localCorrupt={localCorrupt} />
                </ThemeManager>
              </AccessibilityManager>
            </ActionSheetProvider>
          </SafeAreaProvider>
        </IntlProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}

export default Sentry.wrap(App)
