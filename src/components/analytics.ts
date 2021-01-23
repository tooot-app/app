import * as Analytics from 'expo-firebase-analytics'

const analytics = (event: string, params?: { [key: string]: string }) => {
  Analytics.logEvent(event, params)
}

export default analytics
