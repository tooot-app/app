import React from 'react'
import { QueryCache, ReactQueryCacheProvider, setConsole } from 'react-query'

import { Index } from 'src/Index'

const queryCache = new QueryCache()

setConsole({
  log: console.log,
  warn: console.warn,
  error: console.warn
})

const App: React.FC = () => (
  <ReactQueryCacheProvider queryCache={queryCache}>
    <Index />
  </ReactQueryCacheProvider>
)

export default App
