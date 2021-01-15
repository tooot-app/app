import * as Analytics from 'expo-firebase-analytics'
import React from 'react'
import log from './log'

const dev = () => {
  if (__DEV__) {
    Analytics.setDebugModeEnabled(true)

    log('log', 'devs', 'initializing wdyr')
    const whyDidYouRender = require('@welldone-software/why-did-you-render')
    whyDidYouRender(React, {
      trackHooks: true,
      hotReloadBufferMs: 1000
    })
  }
}

export default dev
