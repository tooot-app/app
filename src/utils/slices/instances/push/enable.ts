import apiGeneral from '@api/general'
import apiInstance from '@api/instance'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

const serverRegister = async () => {
  const deviceToken = (await Notifications.getDevicePushTokenAsync()).data
  const expoToken = (
    await Notifications.getExpoPushTokenAsync({
      experienceId: '@xmflsct/tooot'
    })
  ).data

  return apiGeneral<{ endpoint: string; publicKey: string; auth: string }>({
    method: 'post',
    domain: 'testpush.home.xmflsct.com',
    url: 'register',
    body: { deviceToken, expoToken }
  })
}

const pushEnable = async (): Promise<Mastodon.PushSubscription> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!')
    return Promise.reject()
  }

  const serverRes = (await serverRegister()).body

  const formData = new FormData()
  formData.append(
    'subscription[endpoint]',
    'https://testpush.home.xmflsct.com/test1'
  )
  formData.append('subscription[keys][p256dh]', serverRes.publicKey)
  formData.append('subscription[keys][auth]', serverRes.auth)

  const res = await apiInstance<Mastodon.PushSubscription>({
    method: 'post',
    url: 'push/subscription',
    body: formData
  })
  return res.body

  // if (Platform.OS === 'android') {
  //   Notifications.setNotificationChannelAsync('default', {
  //     name: 'default',
  //     importance: Notifications.AndroidImportance.MAX,
  //     vibrationPattern: [0, 250, 250, 250],
  //     lightColor: '#FF231F7C'
  //   })
  // }
}

export default pushEnable
