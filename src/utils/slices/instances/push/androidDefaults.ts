import * as Notifications from 'expo-notifications'

const androidDefaults = {
  importance: Notifications.AndroidImportance.DEFAULT,
  bypassDnd: false,
  showBadge: true,
  enableLights: true,
  enableVibrate: true
}

export default androidDefaults
