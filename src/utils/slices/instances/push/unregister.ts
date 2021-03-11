import apiGeneral from '@api/general'
import apiInstance from '@api/instance'
import { RootState } from '@root/store'
import { getInstance, PUSH_SERVER } from '@utils/slices/instancesSlice'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

const pushUnregister = async (state: RootState, expoToken: string) => {
  const instance = getInstance(state)
  const instanceUri = instance?.uri
  const instanceAccount = instance?.account

  if (!instance?.url || !instance.account.id) {
    return Promise.reject()
  }

  await apiInstance<{}>({
    method: 'delete',
    url: 'push/subscription'
  })

  await apiGeneral<{ endpoint: string; publicKey: string; auth: string }>({
    method: 'post',
    domain: PUSH_SERVER,
    url: 'v1/unregister',
    body: {
      expoToken,
      instanceUrl: instance.url,
      accountId: instance.account.id
    },
    sentry: true
  })

  if (Platform.OS === 'android') {
    const accountFull = `@${instanceAccount?.acct}@${instanceUri}`
    Notifications.deleteNotificationChannelGroupAsync(accountFull)
  }

  return
}

export default pushUnregister
