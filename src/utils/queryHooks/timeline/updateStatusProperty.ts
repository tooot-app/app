import { InfiniteData } from '@tanstack/react-query'
import { queryClient } from '@utils/queryHooks'
import {
  MutationVarsTimelineUpdateStatusProperty,
  QueryKeyTimeline,
  TimelineData
} from '../timeline'

const updateStatusProperty = (
  { status, payload, poll }: MutationVarsTimelineUpdateStatusProperty & { poll?: Mastodon.Poll },
  navigationState: (QueryKeyTimeline | undefined)[]
) => {
  const update = (to?: Mastodon.Status): boolean => {
    if (!to) return false
    enum MapPropertyToCount {
      favourited = 'favourites_count',
      reblogged = 'reblogs_count'
    }
    switch (payload.type) {
      case 'poll':
        to.poll = poll
        return true
      default:
        to[payload.type] = payload.to
        switch (payload.type) {
          case 'favourited':
          case 'reblogged':
            if (payload.to) {
              to[MapPropertyToCount[payload.type]]++
            } else {
              to[MapPropertyToCount[payload.type]]--
            }
            break
        }
        return true
    }
  }

  for (const key of navigationState) {
    if (!key) continue

    queryClient.setQueryData<InfiniteData<TimelineData> | undefined>(key, old => {
      if (old) {
        let updated: boolean = false
        old.pages = old.pages.map(page => {
          if (updated) return page

          if (typeof (page.body as Mastodon.Conversation[])[0].unread === 'boolean') {
            ;(page.body as Mastodon.Conversation[]).forEach(({ last_status }) => {
              if (last_status?.reblog?.id === status.id) {
                updated = update(last_status.reblog)
              } else if (last_status?.id === status.id) {
                updated = update(last_status)
              }
            })
          } else if (typeof (page.body as Mastodon.Notification[])[0].type === 'string') {
            ;(page.body as Mastodon.Notification[]).forEach(no => {
              if (no.status?.reblog?.id === status.id) {
                updated = update(no.status.reblog)
              } else if (no.status?.id === status.id) {
                updated = update(no.status)
              }
            })
          } else {
            ;(page.body as Mastodon.Status[]).forEach(toot => {
              if (toot.reblog?.id === status.id) {
                updated = update(toot.reblog)
              } else if (toot.id === status.id) {
                updated = update(toot)
              }
            })
          }
          return page
        })
      }
      return old
    })
  }
}

export default updateStatusProperty
