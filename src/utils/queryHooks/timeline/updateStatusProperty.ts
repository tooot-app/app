import { InfiniteData } from '@tanstack/react-query'
import queryClient from '@utils/queryHooks'
import { MutationVarsTimelineUpdateStatusProperty, TimelineData } from '../timeline'

const updateStatusProperty = ({
  queryKey,
  rootQueryKey,
  status,
  payload,
  poll
}: MutationVarsTimelineUpdateStatusProperty & { poll?: Mastodon.Poll }) => {
  for (const key of [queryKey, rootQueryKey]) {
    if (!key) continue

    queryClient.setQueryData<InfiniteData<TimelineData> | undefined>(key, old => {
      if (old) {
        let foundToot: Mastodon.Status | undefined = undefined
        old.pages = old.pages.map(page => {
          if (foundToot) {
            return page
          } else {
            if (typeof (page.body as Mastodon.Conversation[])[0].unread === 'boolean') {
              foundToot = (page.body as Mastodon.Conversation[]).find(
                ({ last_status }) => last_status?.id === status.id
              )?.last_status
              return page
            } else if (typeof (page.body as Mastodon.Notification[])[0].type === 'string') {
              foundToot = (page.body as Mastodon.Notification[]).find(
                no => no.status?.id === status.id
              )?.status
            } else {
              foundToot = (page.body as Mastodon.Status[]).find(toot => toot.id === status.id)
            }

            return page
          }
        })

        if (foundToot) {
          enum MapPropertyToCount {
            favourited = 'favourites_count',
            reblogged = 'reblogs_count'
          }

          switch (payload.type) {
            case 'poll':
              status.poll = poll
              break
            default:
              status[payload.type] =
                typeof status[payload.type] === 'boolean' ? !status[payload.type] : true
              switch (payload.type) {
                case 'favourited':
                case 'reblogged':
                  if (typeof status[payload.type] === 'boolean' && status[payload.type]) {
                    status[MapPropertyToCount[payload.type]]--
                  } else {
                    status[MapPropertyToCount[payload.type]]++
                  }
                  break
              }
              break
          }
        }
      }

      return old
    })
  }
}

export default updateStatusProperty
