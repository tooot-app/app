import { isDevelopment } from '@utils/checkEnvironment'
import { setChannels } from '@utils/slices/instances/push/utils'
import { getGlobalStorage, setGlobalStorage } from '@utils/storage/actions'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

export const updateExpoToken = async () => {
  const expoToken = getGlobalStorage.string('app.expo_token')

  if (Platform.OS === 'android') {
    await setChannels()
  }

  if (expoToken.length) {
    return Promise.resolve()
  } else {
    if (isDevelopment) {
      setGlobalStorage('app.expo_token', 'ExponentPushToken[DEVELOPMENT_1]')
      return Promise.resolve()
    }

    return await Notifications.getExpoPushTokenAsync({
      experienceId: '@xmflsct/tooot',
      applicationId: 'com.xmflsct.app.tooot'
    }).then(({ data }) => setGlobalStorage('app.expo_token', data))
  }
}
