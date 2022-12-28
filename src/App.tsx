import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import * as Sentry from '@sentry/react-native'
import { QueryClientProvider } from '@tanstack/react-query'
import AccessibilityManager from '@utils/accessibility/AccessibilityManager'
import getLanguage from '@utils/helpers/getLanguage'
import queryClient from '@utils/queryHooks'
import audio from '@utils/startup/audio'
import log from '@utils/startup/log'
import netInfo from '@utils/startup/netInfo'
import push from '@utils/startup/push'
import sentry from '@utils/startup/sentry'
import timezone from '@utils/startup/timezone'
import { storage } from '@utils/storage'
import {
  getGlobalStorage,
  removeAccount,
  setAccount,
  setGlobalStorage
} from '@utils/storage/actions'
import {
  hasMigratedFromAsyncStorage,
  migrateFromAsyncStorage
} from '@utils/storage/migrations/toMMKV'
import ThemeManager from '@utils/styles/ThemeManager'
import * as Localization from 'expo-localization'
import * as SplashScreen from 'expo-splash-screen'
import React, { useCallback, useEffect, useState } from 'react'
import { LogBox, Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { MMKV } from 'react-native-mmkv'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { enableFreeze } from 'react-native-screens'
import i18n from './i18n'
import Screens from './screens'

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
            log('log', 'App', `Binding storage of ${account}`)
            storage.account = storageAccount
          } else {
            log('log', 'App', `Token not found for ${account}`)
            removeAccount(account)
          }
        } else {
          log('log', 'App', 'No active account available')
          const accounts = getGlobalStorage.object('accounts')
          if (accounts?.length) {
            log('log', 'App', `Setting active account ${accounts[accounts.length - 1]}`)
            setAccount(accounts[accounts.length - 1])
          } else {
            setGlobalStorage('account.active', undefined)
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
        <SafeAreaProvider>
          <ActionSheetProvider>
            <AccessibilityManager>
              <ThemeManager>
                <Screens localCorrupt={localCorrupt} />
              </ThemeManager>
            </AccessibilityManager>
          </ActionSheetProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}

export default Sentry.wrap(App)
