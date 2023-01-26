import { queryClient } from '@utils/queryHooks'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { generateAccountKey, setAccount, useGlobalStorage } from '@utils/storage/actions'
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'
import pushUseNavigate from './useNavigate'

const pushUseRespond = () => {
  const [accountActive] = useGlobalStorage.string('account.active')
  const [accounts] = useGlobalStorage.object('accounts')

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async ({ notification }) => {
        const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Notifications' }]
        queryClient.invalidateQueries(queryKey)
        const payloadData = notification.request.content.data as {
          notification_id?: string
          instanceUrl: string
          accountId: string
        }

        const incomingAccount = generateAccountKey({
          domain: payloadData.instanceUrl,
          id: payloadData.accountId
        })
        const foundAccount = accounts?.find(account => account === incomingAccount)
        if (foundAccount && foundAccount !== accountActive) {
          await setAccount(foundAccount)
        }
        pushUseNavigate(payloadData.notification_id)
      }
    )
    return () => subscription.remove()
  }, [accountActive, accounts])
}

export default pushUseRespond
