import { displayMessage } from '@components/Message'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { Instance, updateInstanceActive } from '@utils/slices/instancesSlice'
import * as Notifications from 'expo-notifications'
import { findIndex } from 'lodash'
import { useEffect } from 'react'
import { QueryClient } from 'react-query'
import { useDispatch } from 'react-redux'
import pushUseNavigate from './useNavigate'

export interface Params {
  queryClient: QueryClient
  instances: Instance[]
}

const pushUseReceive = ({ queryClient, instances }: Params) => {
  const dispatch = useDispatch()

  return useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      notification => {
        const queryKey: QueryKeyTimeline = [
          'Timeline',
          { page: 'Notifications' }
        ]
        queryClient.invalidateQueries(queryKey)
        const payloadData = notification.request.content.data as {
          notification_id?: string
          instanceUrl: string
          accountId: string
        }

        const notificationIndex = findIndex(
          instances,
          instance =>
            instance.url === payloadData.instanceUrl &&
            instance.account.id === payloadData.accountId
        )
        displayMessage({
          duration: 'long',
          message: notification.request.content.title!,
          description: notification.request.content.body!,
          onPress: () => {
            if (notificationIndex !== -1) {
              dispatch(updateInstanceActive(instances[notificationIndex]))
            }
            pushUseNavigate(payloadData.notification_id)
          }
        })
      }
    )
    return () => subscription.remove()
  }, [instances])
}

export default pushUseReceive
