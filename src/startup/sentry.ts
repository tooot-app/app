import * as Sentry from 'sentry-expo'
import log from "./log"

const sentry = () => {
  log('log', 'Sentry', 'initializing')
  Sentry.init({
    dsn:
      'https://c9e29aa05f774aca8f36def98244ce04@o389581.ingest.sentry.io/5571975',
    enableInExpoDevelopment: false,
    debug: __DEV__
  })
}

export default sentry
