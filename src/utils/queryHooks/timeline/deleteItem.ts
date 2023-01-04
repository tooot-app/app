import { InfiniteData } from '@tanstack/react-query'
import { queryClient } from '@utils/queryHooks'
import { MutationVarsTimelineDeleteItem, QueryKeyTimeline, TimelineData } from '../timeline'

const deleteItem = (
  { id }: MutationVarsTimelineDeleteItem,
  navigationState: (QueryKeyTimeline | undefined)[]
) => {
  for (const key of navigationState) {
    if (!key) continue

    queryClient.setQueryData<InfiniteData<TimelineData> | undefined>(key, old => {
      if (old) {
        let foundToot: boolean = false
        old.pages = old.pages.map(page => {
          if (foundToot) return page

          page.body = (page.body as Mastodon.Status[]).filter(
            (item: Mastodon.Status) => item.id !== id
          )

          return page
        })
      }

      return old
    })
  }
}

export default deleteItem
