import * as Sentry from '@sentry/react-native'
import { isDevelopment } from '@utils/helpers/checkEnvironment'
import log from './log'

const sentry = () => {
  log('log', 'Sentry', 'initializing')

  Sentry.init({
    enabled: !isDevelopment,
    dsn: 'https://53348b60ff844d52886e90251b3a5f41@o917354.ingest.sentry.io/6410576',
    beforeBreadcrumb: breadcrumb => {
      if (breadcrumb.type === 'http') {
        const url = breadcrumb.data?.url
        if (url.includes('exp.host/') || url.includes('tooot.app/') || url.includes('/api/v')) {
          return breadcrumb
        }
        return null
      }
      return breadcrumb
    }
  })
}

export default sentry
