import * as Analytics from 'expo-firebase-analytics'
import * as Sentry from 'sentry-expo'

const analytics = (event: string, params?: { [key: string]: string }) => {
  Analytics.logEvent(event, params).catch(
    error => {}
    // Sentry.Native.captureException(error)
  )
}

export default analytics
