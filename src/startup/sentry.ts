import Constants from 'expo-constants'
import * as Sentry from 'sentry-expo'
import log from './log'

const sentry = () => {
  log('log', 'Sentry', 'initializing')
  // return Sentry.init({
  //   dsn: Constants.manifest.extra.sentryDSN,
  //   enableInExpoDevelopment: false,
  //   debug: __DEV__
  // })
}

export default sentry
