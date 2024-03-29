import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { QueryClientProvider } from '@tanstack/react-query'
import AccessibilityManager from '@utils/accessibility/AccessibilityManager'
import { connectVerify } from '@utils/api/helpers/connect'
import getLanguage from '@utils/helpers/getLanguage'
import { queryClient } from '@utils/queryHooks'
import audio from '@utils/startup/audio'
import { dev } from '@utils/startup/dev'
import log from '@utils/startup/log'
import netInfo from '@utils/startup/netInfo'
import push from '@utils/startup/push'
import sentry from '@utils/startup/sentry'
import { GLOBAL } from '@utils/storage'
import { getGlobalStorage, setAccount, setGlobalStorage } from '@utils/storage/actions'
import { migrateFromAsyncStorage, versionStorageGlobal } from '@utils/storage/migrations/toMMKV'
import ThemeManager from '@utils/styles/ThemeManager'
import * as Localization from 'expo-localization'
import * as SplashScreen from 'expo-splash-screen'
import React, { useCallback, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { enableFreeze } from 'react-native-screens'
import i18n from './i18n'
import Screens from './screens'

log('log', 'App', 'delay splash')
SplashScreen.preventAutoHideAsync()

dev()
sentry()
netInfo()
audio()
push()
enableFreeze(true)

const App: React.FC = () => {
  log('log', 'App', 'rendering App')
  const [appIsReady, setAppIsReady] = useState(false)

  const [hasMigrated, setHasMigrated] = useState<boolean>(versionStorageGlobal !== undefined)

  useEffect(() => {
    const prepare = async () => {
      if (!hasMigrated) {
        try {
          await migrateFromAsyncStorage()
          setHasMigrated(true)
        } catch {}
      }

      const useConnect = getGlobalStorage.boolean('app.connect')
      GLOBAL.connect = useConnect
      log('log', 'App', `connect: ${useConnect}`)
      if (useConnect) {
        await connectVerify()
          .then(() => log('log', 'App', 'connected'))
          .catch(() => log('warn', 'App', 'connect verify failed'))
      }

      log('log', 'App', 'loading from MMKV')
      const account = getGlobalStorage.string('account.active')
      if (account) {
        await setAccount(account)
      } else {
        log('log', 'App', 'No active account available')
        const accounts = getGlobalStorage.object('accounts')
        if (accounts?.length) {
          log('log', 'App', `Setting active account ${accounts[accounts.length - 1]}`)
          await setAccount(accounts[accounts.length - 1])
        } else {
          setGlobalStorage('account.active', undefined)
        }
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
                <Screens />
              </ThemeManager>
            </AccessibilityManager>
          </ActionSheetProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}

export default App
