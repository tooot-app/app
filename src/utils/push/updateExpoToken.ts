import { isDevelopment } from '@utils/helpers/checkEnvironment'
import { setChannels } from '@utils/push/constants'
import { getGlobalStorage, setGlobalStorage } from '@utils/storage/actions'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

export const updateExpoToken = async (): Promise<string> => {
  const expoToken = getGlobalStorage.string('app.expo_token')

  if (Platform.OS === 'android') {
    await setChannels()
  }

  if (isDevelopment) {
    setGlobalStorage('app.expo_token', 'ExponentPushToken[DEVELOPMENT_1]')
    return 'ExponentPushToken[DEVELOPMENT_1]'
  }

  return await Notifications.getExpoPushTokenAsync({
    experienceId: '@xmflsct/tooot',
    applicationId: 'com.xmflsct.app.tooot'
  }).then(({ data }) => {
    setGlobalStorage('app.expo_token', data)
    return data
  })
}
