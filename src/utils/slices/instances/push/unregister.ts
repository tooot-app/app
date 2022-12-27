import apiInstance from '@api/instance'
import apiTooot from '@api/tooot'
import { getAccountDetails, getGlobalStorage } from '@utils/storage/actions'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

const pushUnregister = async () => {
  const expoToken = getGlobalStorage.string('app.expo_token')
  const accountDetails = getAccountDetails([
    'push',
    'auth.domain',
    'auth.account.id',
    'auth.account.acct'
  ])
  const domain = accountDetails?.['auth.domain']
  const accountId = accountDetails?.['auth.account.id']

  const pushPath = `${expoToken}/${domain}/${accountId}`

  if (!domain || !accountId || !accountDetails?.push) {
    return Promise.reject()
  }

  await apiInstance<{}>({
    method: 'delete',
    url: 'push/subscription'
  })

  await apiTooot<{ endpoint: string; publicKey: string; auth: string }>({
    method: 'delete',
    url: `push/unsubscribe/${pushPath}`
  })

  if (Platform.OS === 'android') {
    const accountFull = `@${accountDetails['auth.account.acct']}@${domain}`
    Notifications.deleteNotificationChannelGroupAsync(accountFull)
  }

  return
}

export default pushUnregister
