import * as SplashScreen from 'expo-splash-screen'
import React, { useEffect, useState } from 'react'
import { AppearanceProvider } from 'react-native-appearance'
import { QueryCache, ReactQueryCacheProvider, setConsole } from 'react-query'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import { Index } from '@root/Index'
import { persistor, store } from '@root/store'
import ThemeManager from '@utils/styles/ThemeManager'

const queryCache = new QueryCache()

setConsole({
  log: console.log,
  warn: console.warn,
  error: console.warn
})

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
    <AppearanceProvider>
      <ReactQueryCacheProvider queryCache={queryCache}>
        <Provider store={store}>
          <PersistGate
            persistor={persistor}
            onBeforeLift={() => setAppLoaded(true)}
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
      </ReactQueryCacheProvider>
    </AppearanceProvider>
  )
}

export default App
