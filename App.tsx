import React from 'react'
import { AppearanceProvider } from 'react-native-appearance'
import { QueryCache, ReactQueryCacheProvider, setConsole } from 'react-query'
import { Provider } from 'react-redux'

import ThemeManager from 'src/utils/styles/ThemeManager'
import { Index } from 'src/Index'
import { store } from 'src/store'

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
      <ThemeManager>
        <ReactQueryCacheProvider queryCache={queryCache}>
          <Provider store={store}>
            <Index />
          </Provider>
        </ReactQueryCacheProvider>
      </ThemeManager>
    </AppearanceProvider>
  )
}

export default App
