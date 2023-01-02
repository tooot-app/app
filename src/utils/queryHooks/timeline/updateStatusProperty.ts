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
  for (const key of [queryKey]) {
    if (!key) continue

    queryClient.setQueryData<InfiniteData<TimelineData> | undefined>(key, old => {
      console.log('key', key)
      if (old) {
        let foundToot: Mastodon.Status | undefined = undefined
        old.pages = old.pages.map(page => {
          if (foundToot) {
            return page
          } else {
            if (typeof (page.body as Mastodon.Conversation[])[0].unread === 'boolean') {
              foundToot = (page.body as Mastodon.Conversation[]).find(({ last_status }) =>
                last_status?.reblog
                  ? last_status.reblog.id === status.id
                  : last_status?.id === status.id
              )?.last_status
            } else if (typeof (page.body as Mastodon.Notification[])[0].type === 'string') {
              foundToot = (page.body as Mastodon.Notification[]).find(no =>
                no.status?.reblog ? no.status.reblog.id === status.id : no.status?.id === status.id
              )?.status
            } else {
              foundToot = (page.body as Mastodon.Status[]).find(toot =>
                toot.reblog ? toot.reblog.id === status.id : toot.id === status.id
              )
            }

            return page
          }
        })

        if (foundToot) {
          const toot = foundToot as Mastodon.Status
          console.log('updating', toot.id)
          enum MapPropertyToCount {
            favourited = 'favourites_count',
            reblogged = 'reblogs_count'
          }

          switch (payload.type) {
            case 'poll':
              toot.poll = poll
              break
            default:
              console.log('11', toot[payload.type])
              toot[payload.type] = payload.to
              console.log('22', toot[payload.type])
              switch (payload.type) {
                case 'favourited':
                case 'reblogged':
                  if (payload.to) {
                    toot[MapPropertyToCount[payload.type]]++
                  } else {
                    toot[MapPropertyToCount[payload.type]]--
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
