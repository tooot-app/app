import React from 'react'
import { QueryCache, ReactQueryCacheProvider, setConsole } from 'react-query'
import { Provider } from 'react-redux'

import { Index } from 'src/Index'
import { store } from 'src/store'

const queryCache = new QueryCache()

setConsole({
  log: console.log,
  warn: console.warn,
  error: console.warn
})

if (__DEV__) {
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  // whyDidYouRender(React)
}

const App: React.FC = () => (
  <ReactQueryCacheProvider queryCache={queryCache}>
    <Provider store={store}>
      <Index />
    </Provider>
  </ReactQueryCacheProvider>
)

export default App
