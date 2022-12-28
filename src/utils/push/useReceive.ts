import { displayMessage } from '@components/Message'
import queryClient from '@utils/helpers/queryClient'
import initQuery from '@utils/helpers/resetQuries'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { generateAccountKey, useGlobalStorage } from '@utils/storage/actions'
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'
import pushUseNavigate from './useNavigate'

const pushUseReceive = () => {
  const [accounts] = useGlobalStorage.object('accounts')

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Notifications' }]
      queryClient.invalidateQueries(queryKey)
      const payloadData = notification.request.content.data as {
        notification_id?: string
        instanceUrl: string
        accountId: string
      }

      const currAccount = accounts?.find(
        account =>
          account ===
          generateAccountKey({ domain: payloadData.instanceUrl, id: payloadData.accountId })
      )
      displayMessage({
        duration: 'long',
        message: notification.request.content.title!,
        description: notification.request.content.body!,
        onPress: () => {
          if (currAccount) {
            initQuery(currAccount)
          }
          pushUseNavigate(payloadData.notification_id)
        }
      })
    })
    return () => subscription.remove()
  }, [accounts])
}

export default pushUseReceive
