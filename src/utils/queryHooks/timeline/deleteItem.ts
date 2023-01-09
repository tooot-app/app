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
      if (!old) return old

      return {
        ...old,
        pages: old.pages.map(page => ({
          ...page,
          body: (page.body as Mastodon.Status[]).filter(
            status => status.id !== id && status.reblog?.id !== id
          )
        }))
      }
    })
  }
}

export default deleteItem
