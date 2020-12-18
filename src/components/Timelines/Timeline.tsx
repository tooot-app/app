import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { useInfiniteQuery } from 'react-query'

import TimelineNotifications from '@components/Timelines/Timeline/Notifications'
import TimelineDefault from '@components/Timelines/Timeline/Default'
import TimelineConversation from '@components/Timelines/Timeline/Conversation'
import { timelineFetch } from '@utils/fetches/timelineFetch'
import TimelineSeparator from '@components/Timelines/Timeline/Separator'
import TimelineEmpty from '@components/Timelines/Timeline/Empty'
import TimelineEnd from '@components/Timelines/Timeline/Shared/End'
import { useScrollToTop } from '@react-navigation/native'
import { FlatList } from 'react-native-gesture-handler'

export interface Props {
  page: App.Pages
  hashtag?: string
  list?: string
  toot?: Mastodon.Status
  account?: string
  disableRefresh?: boolean
}

const Timeline: React.FC<Props> = ({
  page,
  hashtag,
  list,
  toot,
  account,
  disableRefresh = false
}) => {
  const queryKey: QueryKey.Timeline = [
    page,
    {
      page,
      ...(hashtag && { hashtag }),
      ...(list && { list }),
      ...(toot && { toot }),
      ...(account && { account })
    }
  ]
  const {
    status,
    data,
    refetch,
    hasPreviousPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteQuery(queryKey, timelineFetch, {
    getPreviousPageParam: firstPage => ({
      direction: 'prev',
      id: firstPage.toots[0].id
    }),
    getNextPageParam: lastPage =>
      lastPage.toots.length
        ? {
            direction: 'next',
            id: lastPage.toots[lastPage.toots.length - 1].id
          }
        : undefined
  })
  const flattenData = data?.pages ? data.pages.flatMap(d => [...d?.toots]) : []
  const flattenPointer = data?.pages
    ? data.pages.flatMap(d => [d?.pointer])
    : []
  const flattenPinnedLength = data?.pages
    ? data.pages.flatMap(d => [d?.pinnedLength])
    : []

  const flRef = useRef<FlatList<any>>(null)
  useEffect(() => {
    if (toot && status === 'success') {
      setTimeout(() => {
        flRef.current?.scrollToIndex({
          index: flattenPointer[0]!,
          viewOffset: 100
        })
      }, 500)
    }
  }, [status])

  const flKeyExtrator = useCallback(({ id }) => id, [])
  const flRenderItem = useCallback(({ item, index }) => {
    switch (page) {
      case 'Conversations':
        return <TimelineConversation item={item} queryKey={queryKey} />
      case 'Notifications':
        return <TimelineNotifications notification={item} queryKey={queryKey} />
      default:
        return (
          <TimelineDefault
            item={item}
            queryKey={queryKey}
            index={index}
            {...(flattenPinnedLength &&
              flattenPinnedLength[0] && {
                pinnedLength: flattenPinnedLength[0]
              })}
            {...(toot && toot.id === item.id && { highlighted: true })}
          />
        )
    }
  }, [])
  const flItemSeparatorComponent = useCallback(
    ({ leadingItem }) => (
      <TimelineSeparator
        {...(toot && toot.id === leadingItem.id && { highlighted: true })}
      />
    ),
    []
  )
  const flItemEmptyComponent = useMemo(
    () => <TimelineEmpty status={status} refetch={refetch} />,
    [status]
  )
  const flOnRefresh = useCallback(
    () => !disableRefresh && fetchPreviousPage(),
    []
  )
  const flOnEndReach = useCallback(() => fetchNextPage(), [])
  const flFooter = useCallback(() => {
    return <TimelineEnd hasNextPage={hasNextPage} />
  }, [hasNextPage])
  const onScrollToIndexFailed = useCallback(error => {
    const offset = error.averageItemLength * error.index
    flRef.current?.scrollToOffset({ offset })
    setTimeout(
      () =>
        flRef.current?.scrollToIndex({ index: error.index, viewOffset: 100 }),
      350
    )
  }, [])

  useScrollToTop(flRef)

  return (
    <FlatList
      ref={flRef}
      data={flattenData}
      style={styles.flatList}
      onRefresh={flOnRefresh}
      renderItem={flRenderItem}
      onEndReached={flOnEndReach}
      keyExtractor={flKeyExtrator}
      ListFooterComponent={flFooter}
      refreshing={isFetchingPreviousPage}
      ListEmptyComponent={flItemEmptyComponent}
      ItemSeparatorComponent={flItemSeparatorComponent}
      onEndReachedThreshold={!disableRefresh ? 0.75 : null}
      {...(toot && status === 'success' && { onScrollToIndexFailed })}
    />
  )
}

const styles = StyleSheet.create({
  flatList: {
    minHeight: '100%'
  }
})

export default Timeline
