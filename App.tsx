import * as SplashScreen from 'expo-splash-screen'
import React, { useCallback, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import { Index } from '@root/Index'
import { persistor, store } from '@root/store'
import ThemeManager from '@utils/styles/ThemeManager'
import { resetLocal } from '@root/utils/slices/instancesSlice'
import client from '@root/api/client'

const queryClient = new QueryClient()

// if (__DEV__) {
//   const whyDidYouRender = require('@welldone-software/why-did-you-render')
//   whyDidYouRender(React, {
//     trackAllPureComponents: true,
//     trackHooks: true,
//     hotReloadBufferMs: 1000
//   })
// }

const App: React.FC = () => {
  const [appLoaded, setAppLoaded] = useState(false)
  const [startVerification, setStartVerification] = useState(false)
  const [localCorrupt, setLocalCorrupt] = useState(false)
  useEffect(() => {
    const delaySplash = async () => {
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

  const onBeforeLift = useCallback(() => setStartVerification(true), [])
  useEffect(() => {
    const verifyCredentials = async () => {
      const localUrl = store.getState().instances.local.url
      const localToken = store.getState().instances.local.token

      if (localUrl && localToken) {
        client({
          method: 'get',
          instance: 'remote',
          instanceDomain: localUrl,
          url: `accounts/verify_credentials`,
          headers: { Authorization: `Bearer ${localToken}` }
        })
          .then(res => {
            if (res.body.id !== store.getState().instances.local.account.id) {
              store.dispatch(resetLocal())
              setLocalCorrupt(true)
            }
            setAppLoaded(true)
          })
          .catch(() => {
            store.dispatch(resetLocal())
            setLocalCorrupt(true)
            setAppLoaded(true)
          })
      } else {
        setAppLoaded(true)
      }
    }

    if (startVerification) {
      verifyCredentials()
    }
  }, [startVerification])

  const main = useCallback(
    bootstrapped => {
      if (bootstrapped && appLoaded) {
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
