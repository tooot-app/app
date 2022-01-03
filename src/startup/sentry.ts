import { isDevelopment } from '@utils/checkEnvironment'
import Constants from 'expo-constants'
import * as Sentry from 'sentry-expo'
import log from './log'

const sentry = () => {
  log('log', 'Sentry', 'initializing')
  Sentry.init({
    dsn: Constants.manifest?.extra?.sentryDSN,
    enableInExpoDevelopment: false,
    debug: isDevelopment
  })
}

export default sentry
