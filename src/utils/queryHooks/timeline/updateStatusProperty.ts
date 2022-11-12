import queryClient from '@helpers/queryClient'
import { InfiniteData } from 'react-query'
import {
  MutationVarsTimelineUpdateStatusProperty,
  TimelineData
} from '../timeline'
import updateConversation from './update/conversation'
import updateNotification from './update/notification'
import updateStatus from './update/status'

const updateStatusProperty = ({
  queryKey,
  rootQueryKey,
  id,
  reblog,
  payload
}: MutationVarsTimelineUpdateStatusProperty) => {
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
              typeof (page.body as Mastodon.Conversation[])[0].unread ===
              'boolean'
            ) {
              const items = page.body as Mastodon.Conversation[]
              const tootIndex = items.findIndex(
                ({ last_status }) => last_status?.id === id
              )
              if (tootIndex >= 0) {
                foundToot = true
                updateConversation({ item: items[tootIndex], payload })
              }
              return page
            } else if (
              typeof (page.body as Mastodon.Notification[])[0].type === 'string'
            ) {
              const items = page.body as Mastodon.Notification[]
              const tootIndex = items.findIndex(
                ({ status }) => status?.id === id
              )
              if (tootIndex >= 0) {
                foundToot = true
                updateNotification({ item: items[tootIndex], payload })
              }
            } else {
              const items = page.body as Mastodon.Status[]
              const tootIndex = reblog
                ? items.findIndex(({ reblog }) => reblog?.id === id)
                : items.findIndex(toot => toot.id === id)
              // if favourites page and notifications page, remove the item instead
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

  rootQueryKey &&
    queryClient.setQueryData<InfiniteData<TimelineData> | undefined>(
      rootQueryKey,
      old => {
        if (old) {
          let foundToot = false
          old.pages = old.pages.map(page => {
            // Skip rest of the pages if any toot is found
            if (foundToot) {
              return page
            } else {
              if (
                typeof (page.body as Mastodon.Conversation[])[0].unread ===
                'boolean'
              ) {
                const items = page.body as Mastodon.Conversation[]
                const tootIndex = items.findIndex(
                  ({ last_status }) => last_status?.id === id
                )
                if (tootIndex >= 0) {
                  foundToot = true
                  updateConversation({ item: items[tootIndex], payload })
                }
                return page
              } else if (
                typeof (page.body as Mastodon.Notification[])[0].type ===
                'string'
              ) {
                const items = page.body as Mastodon.Notification[]
                const tootIndex = items.findIndex(
                  ({ status }) => status?.id === id
                )
                if (tootIndex >= 0) {
                  foundToot = true
                  updateNotification({ item: items[tootIndex], payload })
                }
              } else {
                const items = page.body as Mastodon.Status[]
                const tootIndex = reblog
                  ? items.findIndex(({ reblog }) => reblog?.id === id)
                  : items.findIndex(toot => toot.id === id)
                // if favourites page and notifications page, remove the item instead
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
