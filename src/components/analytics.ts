import * as Analytics from 'expo-firebase-analytics'

const analytics = (event: string, params?: { [key: string]: string }) => {
  Analytics.logEvent(event, params).catch(
    error => {}
    // Sentry.Native.captureException(error)
  )
}

export default analytics
