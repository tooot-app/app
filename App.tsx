import Index from '@root/Index'
import { persistor, store } from '@root/store'
import ThemeManager from '@utils/styles/ThemeManager'
import * as SplashScreen from 'expo-splash-screen'
import React, { useCallback, useEffect, useState } from 'react'
import { enableScreens } from 'react-native-screens'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import checkSecureStorageVersion from '@root/startup/checkSecureStorageVersion'
import dev from '@root/startup/dev'
import sentry from '@root/startup/sentry'
import log from '@root/startup/log'
import audio from '@root/startup/audio'
import onlineStatus from '@root/startup/onlineStatus'
import netInfo from '@root/startup/netInfo'

dev()
sentry()
audio()
onlineStatus()

log('log', 'react-query', 'initializing')
const queryClient = new QueryClient()

log('log', 'react-native-screens', 'initializing')
enableScreens()

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
    const netInfoRes = await netInfo()

    if (netInfoRes.corrupted && netInfoRes.corrupted.length) {
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

  const main = useCallback(
    bootstrapped => {
      log('log', 'App', 'bootstrapped')
      if (bootstrapped) {
        log('log', 'App', 'loading actual app :)')
        require('@root/i18n/i18n')
        return (
          <ThemeManager>
            <Index localCorrupt={localCorrupt} />
          </ThemeManager>
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
          children={main}
        />
      </Provider>
    </QueryClientProvider>
  )
}

export default React.memo(App, () => true)
