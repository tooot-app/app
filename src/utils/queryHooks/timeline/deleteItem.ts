import { InfiniteData, QueryClient } from 'react-query'
import { QueryKeyTimeline } from '../timeline'

const deleteItem = ({
  queryClient,
  queryKey,
  id
}: {
  queryClient: QueryClient
  queryKey: QueryKeyTimeline
  id: Mastodon.Status['id']
}) => {
  queryClient.setQueryData<InfiniteData<Mastodon.Conversation[]> | undefined>(
    queryKey,
    old => {
      if (old) {
        old.pages = old.pages.map(page => page.filter(item => item.id !== id))
      }

      return old
    }
  )
}

export default deleteItem
