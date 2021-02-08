import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import {
  getLocalInstance,
  updateLocalNotification
} from '@utils/slices/instancesSlice'
import { useEffect, useRef } from 'react'
import { InfiniteData, useQueryClient } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import ReconnectingWebSocket from 'reconnecting-websocket'

const useWebsocket = ({
  stream,
  event
}: {
  stream: Mastodon.WebSocketStream
  event: 'update' | 'delete' | 'notification'
}) => {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const localInstance = useSelector(getLocalInstance)

  const rws = useRef<ReconnectingWebSocket>()
  useEffect(() => {
    if (!localInstance) {
      return
    }
    rws.current = new ReconnectingWebSocket(
      `${localInstance.urls.streaming_api}/api/v1/streaming?stream=${stream}&access_token=${localInstance.token}`
    )
    rws.current.addEventListener('message', ({ data }) => {
      const message: Mastodon.WebSocket = JSON.parse(data)
      if (message.event === event) {
        switch (message.event) {
          case 'notification':
            const payload: Mastodon.Notification = JSON.parse(message.payload)
            dispatch(
              updateLocalNotification({ latestTime: payload.created_at })
            )
            const queryKey: QueryKeyTimeline = [
              'Timeline',
              { page: 'Notifications' }
            ]
            const queryData = queryClient.getQueryData(queryKey)
            queryData !== undefined &&
              queryClient.setQueryData<
                InfiniteData<Mastodon.Notification[]> | undefined
              >(queryKey, old => {
                if (old) {
                  old.pages[0].unshift(payload)
                  return old
                }
              })
            break
        }
      }
    })
  }, [localInstance?.urls.streaming_api, localInstance?.token])
}

export default useWebsocket
