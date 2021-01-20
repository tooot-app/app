import Constants from 'expo-constants'
import * as Sentry from 'sentry-expo'
import log from './log'

const sentry = () => {
  log('log', 'Sentry', 'initializing')
  Sentry.init({
    environment: Constants.manifest.releaseChannel || 'expo',
    dsn: Constants.manifest.extra.sentryDSN,
    enableInExpoDevelopment: false,
    debug: __DEV__
  })
}

export default sentry
