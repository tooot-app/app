import React from 'react'
import { AppearanceProvider } from 'react-native-appearance'
import { QueryCache, ReactQueryCacheProvider, setConsole } from 'react-query'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import { Index } from './src/Index'
import { persistor, store } from './src/store'
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
  return (
    <AppearanceProvider>
      <ReactQueryCacheProvider queryCache={queryCache}>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            {bootstrapped => {
              if (bootstrapped) {
                require('@root/i18n/i18n')
                return (
                  <ThemeManager>
                    <Index />
                  </ThemeManager>
                )
              } else {
                return <></>
              }
            }}
          </PersistGate>
        </Provider>
      </ReactQueryCacheProvider>
    </AppearanceProvider>
  )
}

export default App
