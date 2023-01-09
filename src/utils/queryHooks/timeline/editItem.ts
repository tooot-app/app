import { InfiniteData } from '@tanstack/react-query'
import { queryClient } from '@utils/queryHooks'
import { MutationVarsTimelineEditItem, TimelineData } from '../timeline'

const editItem = ({ status, navigationState }: MutationVarsTimelineEditItem) => {
  for (const key of navigationState) {
    if (!key) continue

    queryClient.setQueryData<InfiniteData<TimelineData>>(key, old => {
      if (!old) return old

      let updated: boolean = false
      return {
        ...old,
        pages: old.pages.map(page => {
          if (updated) return page

          if (typeof (page.body as Mastodon.Notification[])[0].type === 'string') {
            ;(page.body as Mastodon.Notification[]).forEach(no => {
              if (no.status?.reblog?.id === status.id) {
                updated = true
                no.status.reblog = { ...status }
              } else if (no.status?.id === status.id) {
                updated = true
                no.status = { ...status }
              }
            })
          } else {
            ;(page.body as Mastodon.Status[]).forEach(toot => {
              if (toot.reblog?.id === status.id) {
                updated = true
                toot.reblog = { ...status }
              } else if (toot.id === status.id) {
                updated = true
                toot = { ...status }
              }
            })
          }
          return page
        })
      }
    })
  }
}

export default editItem
