import { displayMessage } from '@components/Message'
import queryClient from '@helpers/queryClient'
import initQuery from '@utils/initQuery'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { getInstances } from '@utils/slices/instancesSlice'
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import pushUseNavigate from './useNavigate'

const pushUseReceive = () => {
  const instances = useSelector(getInstances, (prev, next) => prev.length === next.length)

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Notifications' }]
      queryClient.invalidateQueries(queryKey)
      const payloadData = notification.request.content.data as {
        notification_id?: string
        instanceUrl: string
        accountId: string
      }

      const notificationIndex = instances.findIndex(
        instance =>
          instance.url === payloadData.instanceUrl && instance.account.id === payloadData.accountId
      )
      displayMessage({
        duration: 'long',
        message: notification.request.content.title!,
        description: notification.request.content.body!,
        onPress: () => {
          if (notificationIndex !== -1) {
            initQuery({
              instance: instances[notificationIndex],
              prefetch: { enabled: true }
            })
          }
          pushUseNavigate(payloadData.notification_id)
        }
      })
    })
    return () => subscription.remove()
  }, [instances])
}

export default pushUseReceive
