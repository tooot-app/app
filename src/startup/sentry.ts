import Constants from 'expo-constants'
import * as Sentry from 'sentry-expo'
import log from './log'

const sentry = () => {
  log('log', 'Sentry', 'initializing')
  Sentry.init({
    environment: Constants.manifest.extra.sentryEnv,
    dsn: Constants.manifest.extra.sentryDSN,
    enableInExpoDevelopment: false,
    debug:
      __DEV__ ||
      ['development'].some(channel =>
        Constants.manifest.releaseChannel?.includes(channel)
      )
  })
}

export default sentry
