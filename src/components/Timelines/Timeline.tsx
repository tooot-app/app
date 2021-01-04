import ComponentSeparator from '@components/Separator'
import TimelineConversation from '@components/Timelines/Timeline/Conversation'
import TimelineDefault from '@components/Timelines/Timeline/Default'
import TimelineEmpty from '@components/Timelines/Timeline/Empty'
import TimelineEnd from '@root/components/Timelines/Timeline/End'
import TimelineNotifications from '@components/Timelines/Timeline/Notifications'
import { useScrollToTop } from '@react-navigation/native'
import { timelineFetch } from '@utils/fetches/timelineFetch'
import { updateNotification } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { RefreshControl, StyleSheet } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { InfiniteData, useInfiniteQuery } from 'react-query'
import { useDispatch } from 'react-redux'

export type TimelineData =
  | InfiniteData<{
      toots: Mastodon.Status[]
      pointer?: number | undefined
      pinnedLength?: number | undefined
    }>
  | undefined

export interface Props {
  page: App.Pages
  hashtag?: Mastodon.Tag['name']
  list?: Mastodon.List['id']
  toot?: Mastodon.Status['id']
  account?: Mastodon.Account['id']
  disableRefresh?: boolean
  disableInfinity?: boolean
}

const Timeline: React.FC<Props> = ({
  page,
  hashtag,
  list,
  toot,
  account,
  disableRefresh = false,
  disableInfinity = false
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

  // Clear unread notification badge
  const dispatch = useDispatch()
  useEffect(() => {
    if (page === 'Notifications' && flattenData.length) {
      dispatch(
        updateNotification({
          unread: false,
          latestTime: flattenData[0].created_at
        })
      )
    }
  }, [flattenData])

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
              {...(queryKey[0] === 'RemotePublic' && {
                disableDetails: true,
                disableOnPress: true
              })}
              {...(flattenPinnedLength &&
                flattenPinnedLength[0] && {
                  pinnedLength: flattenPinnedLength[0]
                })}
              {...(toot === item.id && { highlighted: true })}
            />
          )
      }
    },
    [flattenPinnedLength[0]]
  )
  const ItemSeparatorComponent = useCallback(
    ({ leadingItem }) => (
      <ComponentSeparator
        {...(toot === leadingItem.id
          ? { extraMarginLeft: 0 }
          : {
              extraMarginLeft:
                StyleConstants.Avatar.M + StyleConstants.Spacing.S
            })}
      />
    ),
    []
  )
  const flItemEmptyComponent = useMemo(
    () => <TimelineEmpty status={status} refetch={refetch} />,
    [status]
  )
  const onEndReached = useCallback(
    () => !disableInfinity && !isFetchingNextPage && fetchNextPage(),
    [isFetchingNextPage]
  )
  const ListFooterComponent = useCallback(
    () => <TimelineEnd hasNextPage={!disableInfinity ? hasNextPage : false} />,
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
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 2
      }}
    />
  )
}

const styles = StyleSheet.create({
  flatList: {
    minHeight: '100%'
  }
})

// Timeline.whyDidYouRender = true

export default Timeline
