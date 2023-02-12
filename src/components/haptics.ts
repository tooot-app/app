import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

const haptics = (
  type: 'Success' | 'Warning' | 'Error' | 'Light' | 'Medium' | 'Heavy'
) => {
  if (Platform.OS === 'android') {
    if (type === 'Error') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle['Light']).catch(() => {})
    }
    return
  }

  switch (type) {
    case 'Success':
    case 'Warning':
    case 'Error':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType[type]).catch(
        () => {}
      )
      break
    case 'Light':
    case 'Medium':
    case 'Heavy':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle[type]).catch(() => {})
  }
}

export default haptics
