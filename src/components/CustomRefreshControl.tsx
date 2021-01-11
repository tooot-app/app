import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useRef } from 'react'
import { RefreshControl } from 'react-native'
import { InfiniteData, useQueryClient } from 'react-query'

export interface Props {
  queryKey: QueryKeyTimeline
  isFetchingPreviousPage: boolean
  isFetching: boolean
  fetchPreviousPage: () => void
  refetch: () => void
}

const CustomRefreshControl = React.memo(
  ({
    queryKey,
    isFetchingPreviousPage,
    isFetching,
    fetchPreviousPage,
    refetch
  }: Props) => {
    const queryClient = useQueryClient()
    const refreshCount = useRef(0)

    return (
      <RefreshControl
        refreshing={
          refreshCount.current < 2 ? isFetchingPreviousPage : isFetching
        }
        onRefresh={async () => {
          if (refreshCount.current < 2) {
            await fetchPreviousPage()
            refreshCount.current++
          } else {
            queryClient.setQueryData<InfiniteData<any> | undefined>(
              queryKey,
              data => {
                if (data) {
                  return {
                    pages: data.pages.slice(1),
                    pageParams: data.pageParams.slice(1)
                  }
                }
              }
            )
            await refetch()
            refreshCount.current = 0
          }
        }}
      />
    )
  },
  (prev, next) => {
    let skipUpdate = true
    skipUpdate = prev.isFetchingPreviousPage === next.isFetchingPreviousPage
    skipUpdate = prev.isFetching === next.isFetching
    return skipUpdate
  }
)

export default CustomRefreshControl
