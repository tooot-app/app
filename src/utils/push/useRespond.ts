import { Dispatch } from '@reduxjs/toolkit'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { Instance, updateInstanceActive } from '@utils/slices/instancesSlice'
import * as Notifications from 'expo-notifications'
import { findIndex } from 'lodash'
import { useEffect } from 'react'
import { QueryClient } from 'react-query'
import pushUseNavigate from './useNavigate'

export interface Params {
  queryClient: QueryClient
  instances: Instance[]
  dispatch: Dispatch<any>
}

const pushUseRespond = ({ queryClient, instances, dispatch }: Params) => {
  return useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      ({ notification }) => {
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
        if (notificationIndex !== -1) {
          dispatch(updateInstanceActive(instances[notificationIndex]))
          queryClient.clear()
        }
        pushUseNavigate(payloadData.notification_id)
      }
    )
    return () => subscription.remove()
  }, [instances])
}

export default pushUseRespond
