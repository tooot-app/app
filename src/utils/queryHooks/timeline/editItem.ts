import queryClient from '@helpers/queryClient'
import { InfiniteData } from 'react-query'
import { MutationVarsTimelineEditItem } from '../timeline'

const editItem = ({
  queryKey,
  rootQueryKey,
  status
}: MutationVarsTimelineEditItem) => {
  console.log('START')
  queryKey &&
    queryClient.setQueryData<InfiniteData<any> | undefined>(queryKey, old => {
      if (old) {
        old.pages = old.pages.map(page => {
          page.body = page.body.map((item: Mastodon.Status) => {
            if (item.id === status.id) {
              console.log('found queryKey', queryKey)
              console.log('new content', status.content)
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
                console.log('found rootQueryKey', queryKey)
                console.log('new content', status.content)
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
  console.log('EDN')
}

export default editItem
