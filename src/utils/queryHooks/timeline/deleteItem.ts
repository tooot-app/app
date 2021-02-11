import { InfiniteData, QueryClient } from 'react-query'
import { QueryKeyTimeline, TimelineData } from '../timeline'

const deleteItem = ({
  queryClient,
  queryKey,
  id
}: {
  queryClient: QueryClient
  queryKey: QueryKeyTimeline
  id: Mastodon.Status['id']
}) => {
  queryClient.setQueryData<InfiniteData<any> | undefined>(queryKey, old => {
    if (old) {
      old.pages = old.pages.map(page => {
        page.body = page.body.filter((item: Mastodon.Status) => item.id !== id)
        return page
      })
      return old
    }
  })
}

export default deleteItem
