import { findIndex } from 'lodash'
import { InfiniteData, QueryClient } from 'react-query'
import {
  MutationVarsTimelineUpdateStatusProperty,
  TimelineData
} from '../timeline'
import updateConversation from './update/conversation'
import updateNotification from './update/notification'
import updateStatus from './update/status'

const updateStatusProperty = ({
  queryClient,
  queryKey,
  id,
  reblog,
  payload
}: {
  queryClient: QueryClient
  queryKey: MutationVarsTimelineUpdateStatusProperty['queryKey']
  id: MutationVarsTimelineUpdateStatusProperty['id']
  reblog?: MutationVarsTimelineUpdateStatusProperty['reblog']
  payload: MutationVarsTimelineUpdateStatusProperty['payload']
}) => {
  queryClient.setQueryData<InfiniteData<TimelineData> | undefined>(
    queryKey,
    old => {
      if (old) {
        let foundToot = false
        old.pages = old.pages.map(page => {
          // Skip rest of the pages if any toot is found
          if (foundToot) {
            return page
          } else {
            if (
              typeof (page as Mastodon.Conversation[])[0].unread === 'boolean'
            ) {
              const items = page as Mastodon.Conversation[]
              const tootIndex = findIndex(items, ['last_status.id', id])
              if (tootIndex >= 0) {
                foundToot = true
                updateConversation({ item: items[tootIndex], payload })
              }
              return page
            } else if (
              typeof (page as Mastodon.Notification[])[0].type === 'string'
            ) {
              const items = page as Mastodon.Notification[]
              const tootIndex = findIndex(items, ['status.id', id])
              if (tootIndex >= 0) {
                foundToot = true
                updateNotification({ item: items[tootIndex], payload })
              }
            } else {
              const items = page as Mastodon.Status[]
              const tootIndex = findIndex(items, [
                reblog ? 'reblog.id' : 'id',
                id
              ])
              // if favouriets page and notifications page, remove the item instead
              if (tootIndex >= 0) {
                foundToot = true
                updateStatus({ item: items[tootIndex], reblog, payload })
              }
            }

            return page
          }
        })
      }

      return old
    }
  )
}

export default updateStatusProperty
