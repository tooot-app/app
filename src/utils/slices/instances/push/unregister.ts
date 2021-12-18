import apiInstance from '@api/instance'
import apiTooot from '@api/tooot'
import { RootState } from '@root/store'
import { getInstance } from '@utils/slices/instancesSlice'
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

  await apiTooot<{ endpoint: string; publicKey: string; auth: string }>({
    method: 'delete',
    url: `/push/unsubscribe/${expoToken}/${instance.url}/${instance.account.id}`,
    sentry: true
  })

  if (Platform.OS === 'android') {
    const accountFull = `@${instanceAccount?.acct}@${instanceUri}`
    Notifications.deleteNotificationChannelGroupAsync(accountFull)
  }

  return
}

export default pushUnregister
