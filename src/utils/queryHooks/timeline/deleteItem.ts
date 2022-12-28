import { InfiniteData } from '@tanstack/react-query'
import queryClient from '@utils/helpers/queryClient'
import { MutationVarsTimelineDeleteItem } from '../timeline'

const deleteItem = ({
  queryKey,
  rootQueryKey,
  id
}: MutationVarsTimelineDeleteItem) => {
  queryKey &&
    queryClient.setQueryData<InfiniteData<any> | undefined>(queryKey, old => {
      if (old) {
        old.pages = old.pages.map(page => {
          page.body = page.body.filter(
            (item: Mastodon.Status) => item.id !== id
          )
          return page
        })
        return old
      }
    })

  rootQueryKey &&
    queryClient.setQueryData<InfiniteData<any> | undefined>(
      rootQueryKey,
      old => {
        if (old) {
          old.pages = old.pages.map(page => {
            page.body = page.body.filter(
              (item: Mastodon.Status) => item.id !== id
            )
            return page
          })
          return old
        }
      }
    )
}

export default deleteItem
