import * as SplashScreen from 'expo-splash-screen'
import React, { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import { Index } from '@root/Index'
import { persistor, store } from '@root/store'
import ThemeManager from '@utils/styles/ThemeManager'
import { resetLocal, updateLocal } from '@root/utils/slices/instancesSlice'

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

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate
          persistor={persistor}
          onBeforeLift={async () => {
            const localUrl = store.getState().instances.local.url
            const localToken = store.getState().instances.local.token
            if (localUrl && localToken) {
              const dispatchStatus = await store.dispatch(
                updateLocal({ url: localUrl, token: localToken })
              )
              if (dispatchStatus.type.includes('/rejected')) {
                store.dispatch(resetLocal())
              }
            }
            setAppLoaded(true)
          }}
        >
          {bootstrapped => {
            if (bootstrapped) {
              require('@root/i18n/i18n')
              return (
                <ThemeManager>
                  <Index />
                </ThemeManager>
              )
            } else {
              return null
            }
          }}
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  )
}

export default App
