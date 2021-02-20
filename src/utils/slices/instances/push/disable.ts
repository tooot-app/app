import apiGeneral from '@api/general'
import * as Notifications from 'expo-notifications'

const serverUnregister = async () => {
  const deviceToken = (await Notifications.getDevicePushTokenAsync()).data

  return apiGeneral<{ endpoint: string; publicKey: string; auth: string }>({
    method: 'post',
    domain: 'testpush.home.xmflsct.com',
    url: 'unregister',
    body: { deviceToken }
  })
}

const pushDisable = async () => {
  await serverUnregister()

  return false
}

export default pushDisable
