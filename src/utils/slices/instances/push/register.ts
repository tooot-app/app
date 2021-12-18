import apiInstance from '@api/instance'
import apiTooot, { TOOOT_API_DOMAIN } from '@api/tooot'
import i18n from '@root/i18n/i18n'
import { RootState } from '@root/store'
import { getInstance, Instance } from '@utils/slices/instancesSlice'
import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'
import * as Random from 'expo-random'
import { Platform } from 'react-native'
import base64 from 'react-native-base64'
import androidDefaults from './androidDefaults'

const subscribe = async ({
  expoToken,
  instanceUrl,
  accountId,
  accountFull,
  serverKey,
  auth
}: {
  expoToken: string
  instanceUrl: string
  accountId: Mastodon.Account['id']
  accountFull: string
  serverKey: string
  auth: string | null
}) => {
  return apiTooot({
    method: 'post',
    url: `/push/subscribe/${expoToken}/${instanceUrl}/${accountId}`,
    body: { accountFull, serverKey, auth },
    sentry: true
  })
}

const pushRegister = async (
  state: RootState,
  expoToken: string
): Promise<Instance['push']['keys']['auth']> => {
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

  const endpoint = `https://${TOOOT_API_DOMAIN}/push/send/${expoToken}/${instanceUrl}/${accountId}`
  const auth = base64.encodeFromByteArray(Random.getRandomBytes(16))

  const alerts = instancePush.alerts
  const formData = new FormData()
  formData.append('subscription[endpoint]', endpoint)
  formData.append(
    'subscription[keys][p256dh]',
    Constants.manifest?.extra?.toootPushKeyPublic
  )
  formData.append('subscription[keys][auth]', auth)
  Object.keys(alerts).map(key =>
    // @ts-ignore
    formData.append(`data[alerts][${key}]`, alerts[key].value.toString())
  )

  const res = await apiInstance<Mastodon.PushSubscription>({
    method: 'post',
    url: 'push/subscription',
    body: formData
  })

  await subscribe({
    expoToken,
    instanceUrl,
    accountId,
    accountFull,
    serverKey: res.body.server_key,
    auth: instancePush.decode.value === false ? null : auth
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

  return Promise.resolve(auth)
}

export default pushRegister
