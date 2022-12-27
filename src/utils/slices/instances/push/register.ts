import apiInstance from '@api/instance'
import apiTooot, { TOOOT_API_DOMAIN } from '@api/tooot'
import { displayMessage } from '@components/Message'
import * as Sentry from '@sentry/react-native'
import { InstanceLatest } from '@utils/migrations/instances/migration'
import { getAccountDetails, getGlobalStorage } from '@utils/storage/actions'
import * as Random from 'expo-random'
import i18next from 'i18next'
import { Platform } from 'react-native'
import base64 from 'react-native-base64'
import { setChannels } from './utils'

const pushRegister = async (): Promise<InstanceLatest['push']['keys']['auth']> => {
  const expoToken = getGlobalStorage.string('app.expo_token')
  const accountDetails = getAccountDetails([
    'push',
    'auth.domain',
    'auth.account.id',
    'auth.account.acct'
  ])
  const domain = accountDetails?.['auth.domain']
  const accountId = accountDetails?.['auth.account.id']

  if (!domain || !accountId || !accountDetails?.push) {
    return Promise.reject()
  }

  const pushPath = `${expoToken}/${domain}/${accountId}`

  const accountFull = `@${accountDetails['auth.account.acct']}@${domain}`
  const randomPath = (Math.random() + 1).toString(36).substring(2)

  const endpoint = `https://${TOOOT_API_DOMAIN}/push/send/${pushPath}/${randomPath}`
  const auth = base64.encodeFromByteArray(Random.getRandomBytes(16))

  const alerts = accountDetails.push.alerts
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
      instance: domain,
      resBody: res.body
    })
    Sentry.captureMessage('Push register error')
    return Promise.reject()
  }

  await apiTooot({
    method: 'post',
    url: `push/subscribe/${pushPath}`,
    body: {
      accountFull,
      serverKey: res.body.server_key,
      auth: accountDetails.push.decode === false ? null : auth
    }
  })

  if (Platform.OS === 'android') {
    setChannels(true)
  }

  return Promise.resolve(auth)
}

export default pushRegister
