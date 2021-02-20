import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import {
  getInstance,
  updateInstanceNotification
} from '@utils/slices/instancesSlice'
import { useEffect, useRef } from 'react'
import { useQueryClient } from 'react-query'
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
  const localInstance = useSelector(
    getInstance,
    (prev, next) =>
      prev?.urls.streaming_api === next?.urls.streaming_api &&
      prev?.token === next?.token
  )

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
              updateInstanceNotification({ latestTime: payload.created_at })
            )
            const queryKey: QueryKeyTimeline = [
              'Timeline',
              { page: 'Notifications' }
            ]
            queryClient.invalidateQueries(queryKey)
            break
        }
      }
    })
  }, [localInstance?.urls.streaming_api, localInstance?.token])
}

export default useWebsocket
