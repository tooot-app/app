import * as Haptics from 'expo-haptics'
import * as Sentry from 'sentry-expo'

const haptics = (
  type: 'Success' | 'Warning' | 'Error' | 'Light' | 'Medium' | 'Heavy'
) => {
  switch (type) {
    case 'Success':
    case 'Warning':
    case 'Error':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType[type]).catch(
        error => Sentry.Native.captureException(error)
      )
      break
    case 'Light':
    case 'Medium':
    case 'Heavy':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle[type]).catch(error =>
        Sentry.Native.captureException(error)
      )
  }
}

export default haptics
