import ComponentSeparator from '@components/Separator'
import TimelineConversation from '@components/Timelines/Timeline/Conversation'
import TimelineDefault from '@components/Timelines/Timeline/Default'
import TimelineEmpty from '@components/Timelines/Timeline/Empty'
import TimelineEnd from '@root/components/Timelines/Timeline/End'
import TimelineHeader from '@components/Timelines/Timeline/Header'
import TimelineNotifications from '@components/Timelines/Timeline/Notifications'
import { useScrollToTop } from '@react-navigation/native'
import { localUpdateNotification } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { useDispatch } from 'react-redux'
import { QueryKeyTimeline, useTimelineQuery } from '@utils/queryHooks/timeline'
import { findIndex } from 'lodash'
import CustomRefreshControl from '@components/CustomRefreshControl'

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
  const queryKeyParams = {
    page,
    ...(hashtag && { hashtag }),
    ...(list && { list }),
    ...(toot && { toot }),
    ...(account && { account })
  }
  const queryKey: QueryKeyTimeline = ['Timeline', queryKeyParams]
  const {
    status,
    data,
    refetch,
    isSuccess,
    isFetching,
    hasPreviousPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useTimelineQuery({
    ...queryKeyParams,
    options: {
      getPreviousPageParam: firstPage => {
        return firstPage.length
          ? {
              direction: 'prev',
              id: firstPage[0].last_status
                ? firstPage[0].last_status.id
                : firstPage[0].id
            }
          : undefined
      },
      getNextPageParam: lastPage => {
        return lastPage.length
          ? {
              direction: 'next',
              id: lastPage[lastPage.length - 1].last_status
                ? lastPage[lastPage.length - 1].last_status.id
                : lastPage[lastPage.length - 1].id
            }
          : undefined
      }
    }
  })

  const flattenData = data?.pages ? data.pages.flatMap(d => [...d]) : []

  // Clear unread notification badge
  const dispatch = useDispatch()
  useEffect(() => {
    if (page === 'Notifications' && flattenData.length) {
      dispatch(
        localUpdateNotification({
          unread: false,
          latestTime: (flattenData[0] as Mastodon.Notification).created_at
        })
      )
    }
  }, [flattenData])

  const flRef = useRef<FlatList<any>>(null)
  useEffect(() => {
    if (toot && isSuccess) {
      const pointer = findIndex(flattenData, ['id', toot])
      setTimeout(() => {
        flRef.current?.scrollToIndex({
          index: pointer,
          viewOffset: 100
        })
      }, 500)
    }
  }, [isSuccess, flattenData])

  const keyExtractor = useCallback(({ id }) => id, [])
  const renderItem = useCallback(({ item }) => {
    switch (page) {
      case 'Conversations':
        return <TimelineConversation conversation={item} queryKey={queryKey} />
      case 'Notifications':
        return <TimelineNotifications notification={item} queryKey={queryKey} />
      default:
        return (
          <TimelineDefault
            item={item}
            queryKey={queryKey}
            {...(queryKey[1].page === 'RemotePublic' && {
              disableDetails: true,
              disableOnPress: true
            })}
            {...(toot === item.id && { highlighted: true })}
          />
        )
    }
  }, [])
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
  const ListHeaderComponent = useCallback(() => <TimelineHeader />, [])
  const ListFooterComponent = useCallback(
    () => <TimelineEnd hasNextPage={!disableInfinity ? hasNextPage : false} />,
    [hasNextPage]
  )
  const refreshControl = useMemo(
    () => (
      <CustomRefreshControl
        queryKey={queryKey}
        isFetchingPreviousPage={isFetchingNextPage}
        isFetching={isFetching}
        fetchPreviousPage={fetchPreviousPage}
        refetch={refetch}
      />
    ),
    [isFetchingPreviousPage, isFetching]
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
      {...(queryKey &&
        queryKey[1].page === 'RemotePublic' && { ListHeaderComponent })}
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

export default Timeline
