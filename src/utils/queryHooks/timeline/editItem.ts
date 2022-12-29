import { InfiniteData } from '@tanstack/react-query'
import queryClient from '@utils/queryHooks'
import { MutationVarsTimelineEditItem } from '../timeline'

const editItem = ({
  queryKey,
  rootQueryKey,
  status
}: MutationVarsTimelineEditItem) => {
  queryKey &&
    queryClient.setQueryData<InfiniteData<any> | undefined>(queryKey, old => {
      if (old) {
        old.pages = old.pages.map(page => {
          page.body = page.body.map((item: Mastodon.Status) => {
            if (item.id === status.id) {
              item = status
            }
            return item
          })
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
            page.body = page.body.map((item: Mastodon.Status) => {
              if (item.id === status.id) {
                item = status
              }
              return item
            })
            return page
          })
          return old
        }
      }
    )
}

export default editItem
