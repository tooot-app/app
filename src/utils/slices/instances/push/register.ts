import apiInstance from '@api/instance'
import apiTooot, { TOOOT_API_DOMAIN } from '@api/tooot'
import { displayMessage } from '@components/Message'
import { RootState } from '@root/store'
import * as Sentry from '@sentry/react-native'
import { InstanceLatest } from '@utils/migrations/instances/migration'
import { getInstance } from '@utils/slices/instancesSlice'
import * as Random from 'expo-random'
import i18next from 'i18next'
import { Platform } from 'react-native'
import base64 from 'react-native-base64'
import { setChannels } from './utils'

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
    url: `push/subscribe/${expoToken}/${instanceUrl}/${accountId}`,
    body: { accountFull, serverKey, auth }
  })
}

const pushRegister = async (
  state: RootState,
  expoToken: string
): Promise<InstanceLatest['push']['keys']['auth']> => {
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
  const randomPath = (Math.random() + 1).toString(36).substring(2)

  const endpoint = `https://${TOOOT_API_DOMAIN}/push/send/${expoToken}/${instanceUrl}/${accountId}/${randomPath}`
  const auth = base64.encodeFromByteArray(Random.getRandomBytes(16))

  const alerts = instancePush.alerts
  const formData = new FormData()
  formData.append('subscription[endpoint]', endpoint)
  formData.append(
    'subscription[keys][p256dh]',
    'BMn2PLpZrMefG981elzG6SB1EY9gU7QZwmtZ/a/J2vUeWG+zXgeskMPwHh4T/bxsD4l7/8QT94F57CbZqYRRfJo='
  )
  formData.append('subscription[keys][auth]', auth)
  for (const [key, value] of Object.entries(alerts)) {
    formData.append(`data[alerts][${key}]`, value.toString())
  }

  const res = await apiInstance<Mastodon.PushSubscription>({
    method: 'post',
    url: 'push/subscription',
    body: formData
  })

  if (!res.body.server_key?.length) {
    displayMessage({
      type: 'danger',
      duration: 'long',
      message: i18next.t('screenTabs:me.push.missingServerKey.message'),
      description: i18next.t('screenTabs:me.push.missingServerKey.description')
    })
    Sentry.setContext('Push server key', {
      instance: instanceUri,
      resBody: res.body
    })
    Sentry.captureMessage('Push register error')
    return Promise.reject()
  }

  await subscribe({
    expoToken,
    instanceUrl,
    accountId,
    accountFull,
    serverKey: res.body.server_key,
    auth: instancePush.decode === false ? null : auth
  })

  if (Platform.OS === 'android') {
    setChannels(true)
  }

  return Promise.resolve(auth)
}

export default pushRegister
