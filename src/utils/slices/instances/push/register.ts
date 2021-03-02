import apiGeneral from '@api/general'
import apiInstance from '@api/instance'
import i18n from '@root/i18n/i18n'
import { RootState } from '@root/store'
import {
  getInstance,
  Instance,
  PUSH_SERVER
} from '@utils/slices/instancesSlice'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import androidDefaults from './androidDefaults'

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

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelGroupAsync(accountFull, {
      name: accountFull,
      ...androidDefaults
    }).then(group => {
      if (group) {
        if (instancePush.decode.value === false) {
          Notifications.setNotificationChannelAsync(`${group.id}_default`, {
            groupId: group.id,
            name: i18n.t('meSettingsPush:content.default.heading'),
            ...androidDefaults
          })
        } else {
          Notifications.setNotificationChannelAsync(`${group.id}_follow`, {
            groupId: group.id,
            name: i18n.t('meSettingsPush:content.follow.heading'),
            ...androidDefaults
          })
          Notifications.setNotificationChannelAsync(`${group.id}_favourite`, {
            groupId: group.id,
            name: i18n.t('meSettingsPush:content.favourite.heading'),
            ...androidDefaults
          })
          Notifications.setNotificationChannelAsync(`${group.id}_reblog`, {
            groupId: group.id,
            name: i18n.t('meSettingsPush:content.reblog.heading'),
            ...androidDefaults
          })
          Notifications.setNotificationChannelAsync(`${group.id}_mention`, {
            groupId: group.id,
            name: i18n.t('meSettingsPush:content.mention.heading'),
            ...androidDefaults
          })
          Notifications.setNotificationChannelAsync(`${group.id}_poll`, {
            groupId: group.id,
            name: i18n.t('meSettingsPush:content.poll.heading'),
            ...androidDefaults
          })
        }
      }
    })
  }

  return Promise.resolve(serverRes.body.keys)
}

export default pushRegister
