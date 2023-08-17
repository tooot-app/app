import { isDevelopment } from '@utils/helpers/checkEnvironment'
import { setChannels } from '@utils/push/constants'
import { getGlobalStorage, setGlobalStorage } from '@utils/storage/actions'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

export const toRawExpoToken = (token: string): string =>
  token.replace('ExponentPushToken[', '').replace(']', '')

export const updateExpoToken = async (): Promise<string> => {
  const expoToken = getGlobalStorage.string('app.expo_token')

  if (Platform.OS === 'android') {
    await setChannels()
  }

  const getAndSetToken = () => {
    if (isDevelopment) {
      const devToken = toRawExpoToken('ExponentPushToken[DEVELOPMENT_1]')
      setGlobalStorage('app.expo_token', devToken)
      return devToken
    } else {
      return Notifications.getExpoPushTokenAsync({
        projectId: '3288313f-3ff0-496a-a5a9-d8985e7cad5f',
        applicationId: 'com.xmflsct.app.tooot'
      }).then(({ data }) => {
        setGlobalStorage('app.expo_token', toRawExpoToken(data))
        return data
      })
    }
  }

  if (expoToken?.length) {
    getAndSetToken()
    return Promise.resolve(expoToken)
  } else {
    return await getAndSetToken()
  }
}
