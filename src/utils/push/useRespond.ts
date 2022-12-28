import queryClient from '@utils/helpers/queryClient'
import initQuery from '@utils/helpers/resetQuries'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { useGlobalStorage } from '@utils/storage/actions'
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'
import pushUseNavigate from './useNavigate'

const pushUseRespond = () => {
  const [accounts] = useGlobalStorage.object('accounts')

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      ({ notification }) => {
        const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Notifications' }]
        queryClient.invalidateQueries(queryKey)
        const payloadData = notification.request.content.data as {
          notification_id?: string
          instanceUrl: string
          accountId: string
        }

        const accountIndex = accounts.findIndex(
          account => account === `${payloadData.instanceUrl}/${payloadData.accountId}`
        )
        if (accountIndex > -1) {
          initQuery(accounts[accountIndex])
        }
        pushUseNavigate(payloadData.notification_id)
      }
    )
    return () => subscription.remove()
  }, [accounts])
}

export default pushUseRespond
