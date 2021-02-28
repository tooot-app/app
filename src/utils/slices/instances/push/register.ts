import apiGeneral from '@api/general'
import apiInstance from '@api/instance'
import { RootState } from '@root/store'
import {
  getInstance,
  Instance,
  PUSH_SERVER
} from '@utils/slices/instancesSlice'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

const register1 = async ({
  expoToken,
  instanceUrl,
  accountId,
  accountFull
}: {
  expoToken: string
  instanceUrl: string
  accountId: Mastodon.Account['id']
  accountFull: string
}) => {
  return apiGeneral<{
    endpoint: string
    keys: { public: string; private: string; auth: string }
  }>({
    method: 'post',
    domain: PUSH_SERVER,
    url: 'v1/register1',
    body: { expoToken, instanceUrl, accountId, accountFull }
  })
}

const register2 = async ({
  expoToken,
  serverKey,
  instanceUrl,
  accountId,
  removeKeys
}: {
  expoToken: string
  serverKey: Mastodon.PushSubscription['server_key']
  instanceUrl: string
  accountId: Mastodon.Account['id']
  removeKeys: boolean
}) => {
  return apiGeneral({
    method: 'post',
    domain: PUSH_SERVER,
    url: 'v1/register2',
    body: { expoToken, instanceUrl, accountId, serverKey, removeKeys }
  })
}

const pushRegister = async (
  state: RootState,
  expoToken: string
): Promise<Instance['push']['keys']> => {
  const instance = getInstance(state)
  const instanceUrl = instance?.url
  const instanceUri = instance?.uri
  const instanceAccount = instance?.account
  const instancePush = instance?.push

  if (!instanceUrl || !instanceUri || !instanceAccount || !instancePush) {
    return Promise.reject()
  }

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

  const accountId = instanceAccount.id
  const accountFull = `@${instanceAccount.acct}@${instanceUri}`
  const serverRes = await register1({
    expoToken,
    instanceUrl,
    accountId,
    accountFull
  })

  const alerts = instancePush.alerts
  const formData = new FormData()
  formData.append('subscription[endpoint]', serverRes.body.endpoint)
  formData.append('subscription[keys][p256dh]', serverRes.body.keys.public)
  formData.append('subscription[keys][auth]', serverRes.body.keys.auth)
  Object.keys(alerts).map(key =>
    // @ts-ignore
    formData.append(`data[alerts][${key}]`, alerts[key].value.toString())
  )

  const res = await apiInstance<Mastodon.PushSubscription>({
    method: 'post',
    url: 'push/subscription',
    body: formData
  })

  await register2({
    expoToken,
    serverKey: res.body.server_key,
    instanceUrl,
    accountId,
    removeKeys: instancePush.decode.value === false
  })

  return Promise.resolve(serverRes.body.keys)

  // if (Platform.OS === 'android') {
  //   Notifications.setNotificationChannelAsync('default', {
  //     name: 'default',
  //     importance: Notifications.AndroidImportance.MAX,
  //     vibrationPattern: [0, 250, 250, 250],
  //     lightColor: '#FF231F7C'
  //   })
  // }
}

export default pushRegister
