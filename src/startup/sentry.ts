import { isRelease } from '@utils/checkEnvironment'
import * as Sentry from 'sentry-expo'
import log from './log'

const sentry = () => {
  log('log', 'Sentry', 'initializing')
  Sentry.init({
    dsn: 'https://53348b60ff844d52886e90251b3a5f41@o917354.ingest.sentry.io/6410576',
    enableInExpoDevelopment: true,
    debug: !isRelease
  })
}

export default sentry
