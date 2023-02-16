import * as Sentry from '@sentry/react-native'
import { isDevelopment } from '@utils/helpers/checkEnvironment'
import log from './log'

const sentry = () => {
  log('log', 'Sentry', 'initializing')

  Sentry.init({
    enabled: !isDevelopment,
    dsn: 'https://53348b60ff844d52886e90251b3a5f41@o917354.ingest.sentry.io/6410576',
    autoSessionTracking: true
  })
}

export default sentry
