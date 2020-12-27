import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { RefreshControl, StyleSheet } from 'react-native'
import { InfiniteData, useInfiniteQuery } from 'react-query'

import TimelineNotifications from '@components/Timelines/Timeline/Notifications'
import TimelineDefault from '@components/Timelines/Timeline/Default'
import TimelineConversation from '@components/Timelines/Timeline/Conversation'
import { timelineFetch } from '@utils/fetches/timelineFetch'
import TimelineSeparator from '@components/Timelines/Timeline/Separator'
import TimelineEmpty from '@components/Timelines/Timeline/Empty'
import TimelineEnd from '@components/Timelines/Timeline/Shared/End'
import { useScrollToTop } from '@react-navigation/native'
import { FlatList } from 'react-native-gesture-handler'

export type TimelineData =
  | InfiniteData<{
      toots: Mastodon.Status[]
      pointer?: number | undefined
      pinnedLength?: number | undefined
    }>
  | undefined

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
    isSuccess,
    hasPreviousPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteQuery(queryKey, timelineFetch, {
    getPreviousPageParam: firstPage => {
      return firstPage.toots.length
        ? {
            direction: 'prev',
            id: firstPage.toots[0].id
          }
        : undefined
    },
    getNextPageParam: lastPage => {
      return lastPage.toots.length
        ? {
            direction: 'next',
            id: lastPage.toots[lastPage.toots.length - 1].id
          }
        : undefined
    }
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
    if (toot && isSuccess) {
      setTimeout(() => {
        flRef.current?.scrollToIndex({
          index: flattenPointer[0]!,
          viewOffset: 100
        })
      }, 500)
    }
  }, [isSuccess])

  const keyExtractor = useCallback(({ id }) => id, [])
  const renderItem = useCallback(
    ({ item, index }) => {
      switch (page) {
        case 'Conversations':
          return (
            <TimelineConversation conversation={item} queryKey={queryKey} />
          )
        case 'Notifications':
          return (
            <TimelineNotifications notification={item} queryKey={queryKey} />
          )
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
    },
    [flattenPinnedLength[0]]
  )
  const ItemSeparatorComponent = useCallback(
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
  const onEndReached = useCallback(
    () => !disableRefresh && !isFetchingNextPage && fetchNextPage(),
    [isFetchingNextPage]
  )
  const ListFooterComponent = useCallback(
    () => <TimelineEnd hasNextPage={!disableRefresh ? hasNextPage : false} />,
    [hasNextPage]
  )
  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isFetchingPreviousPage}
        onRefresh={() => fetchPreviousPage()}
      />
    ),
    [isFetchingPreviousPage]
  )
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
      windowSize={11}
      data={flattenData}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      style={styles.flatList}
      renderItem={renderItem}
      onEndReached={onEndReached}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.75}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={flItemEmptyComponent}
      {...(!disableRefresh && { refreshControl })}
      ItemSeparatorComponent={ItemSeparatorComponent}
      {...(toot && isSuccess && { onScrollToIndexFailed })}
    />
  )
}

const styles = StyleSheet.create({
  flatList: {
    minHeight: '100%'
  }
})

export default Timeline
