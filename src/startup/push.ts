import * as Notifications from 'expo-notifications'
import log from './log'

const push = () => {
  log('log', 'Push', 'initializing')
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: false,
      shouldPlaySound: false,
      shouldSetBadge: false
    })
  })
  Notifications.setBadgeCountAsync(0)
  Notifications.dismissAllNotificationsAsync()
}

export default push
