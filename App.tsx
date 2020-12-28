import NetInfo from '@react-native-community/netinfo'
import client from '@root/api/client'
import { Index } from '@root/Index'
import { persistor, store } from '@root/store'
import { resetLocal } from '@root/utils/slices/instancesSlice'
import ThemeManager from '@utils/styles/ThemeManager'
import chalk from 'chalk'
import * as SplashScreen from 'expo-splash-screen'
import React, { useCallback, useEffect, useState } from 'react'
import { Platform, Text } from 'react-native'
import { enableScreens } from 'react-native-screens'
import { onlineManager, QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import * as Sentry from 'sentry-expo'

const ctx = new chalk.Instance({ level: 3 })
const startingLog = (type: 'log' | 'warn' | 'error', message: string) => {
  switch (type) {
    case 'log':
      console.log(ctx.bgBlue.bold(' Start up ') + ' ' + message)
      break
    case 'warn':
      console.log(ctx.bgBlue.bold(' Start up ') + ' ' + message)
      break
    case 'error':
      console.log(ctx.bgBlue.bold(' Start up ') + ' ' + message)
      break
  }
}

if (__DEV__) {
  startingLog('log', 'initializing wdyr')
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  whyDidYouRender(React, {
    trackHooks: true,
    hotReloadBufferMs: 1000
  })
}

startingLog('log', 'initializing Sentry')
Sentry.init({
  dsn:
    'https://c9e29aa05f774aca8f36def98244ce04@o389581.ingest.sentry.io/5571975',
  enableInExpoDevelopment: false,
  debug: __DEV__
})

startingLog('log', 'initializing react-query')
const queryClient = new QueryClient()

startingLog('log', 'initializing native screen')
enableScreens()

const App: React.FC = () => {
  startingLog('log', 'rendering App')
  const [appLoaded, setAppLoaded] = useState(false)
  const [localCorrupt, setLocalCorrupt] = useState(false)

  useEffect(() => {
    const onlineState = onlineManager.setEventListener(setOnline => {
      startingLog('log', 'added onlineManager listener')
      return NetInfo.addEventListener(state => {
        startingLog('warn', `setting online state ${state.isConnected}`)
        // @ts-ignore
        setOnline(state.isConnected)
      })
    })
    return () => {
      onlineState
    }
  }, [])

  useEffect(() => {
    const delaySplash = async () => {
      startingLog('log', 'delay splash')
      try {
        await SplashScreen.preventAutoHideAsync()
      } catch (e) {
        console.warn(e)
      }
    }
    delaySplash()
  }, [])
  useEffect(() => {
    const hideSplash = async () => {
      startingLog('log', 'hide splash')
      try {
        await SplashScreen.hideAsync()
      } catch (e) {
        console.warn(e)
      }
    }
    if (appLoaded) {
      hideSplash()
    }
  }, [appLoaded])

  const onBeforeLift = useCallback(() => {
    NetInfo.fetch().then(netInfo => {
      startingLog('log', 'on before lift')
      const localUrl = store.getState().instances.local.url
      const localToken = store.getState().instances.local.token
      if (netInfo.isConnected) {
        startingLog('log', 'network connected')
        if (localUrl && localToken) {
          startingLog('log', 'checking locally stored credentials')
          client({
            method: 'get',
            instance: 'remote',
            instanceDomain: localUrl,
            url: `accounts/verify_credentials`,
            headers: { Authorization: `Bearer ${localToken}` }
          })
            .then(res => {
              startingLog('log', 'local credential check passed')
              if (res.body.id !== store.getState().instances.local.account.id) {
                store.dispatch(resetLocal())
                setLocalCorrupt(true)
              }
              setAppLoaded(true)
            })
            .catch(error => {
              startingLog('error', 'local credential check failed')
              if (error.status && typeof error.status === 'number') {
                store.dispatch(resetLocal())
                setLocalCorrupt(true)
              }
              setAppLoaded(true)
            })
        } else {
          startingLog('log', 'no local credential found')
          setAppLoaded(true)
        }
      } else {
        startingLog('warn', 'network not connected')
        setAppLoaded(true)
      }
    })
  }, [])

  const main = useCallback(
    bootstrapped => {
      startingLog('log', 'bootstrapped')
      if (bootstrapped && appLoaded) {
        startingLog('log', 'loading actual app :)')
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
    [appLoaded]
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

export default App
