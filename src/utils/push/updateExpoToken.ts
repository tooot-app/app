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

  const getAndSetToken = () =>
    Notifications.getExpoPushTokenAsync({
      projectId: '3288313f-3ff0-496a-a5a9-d8985e7cad5f',
      applicationId: 'com.xmflsct.app.tooot',
      devicePushToken: { type: Platform.OS === 'android' ? 'android' : 'ios', data: 'unknown' }
    }).then(({ data }) => {
      setGlobalStorage('app.expo_token', data)
      return data
    })

  if (expoToken?.length) {
    getAndSetToken()
    return Promise.resolve(expoToken)
  } else {
    if (isDevelopment) {
      setGlobalStorage('app.expo_token', 'ExponentPushToken[DEVELOPMENT_1]')
      return Promise.resolve('ExponentPushToken[DEVELOPMENT_1]')
    }

    return await getAndSetToken()
  }
}
