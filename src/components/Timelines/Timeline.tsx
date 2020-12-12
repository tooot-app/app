import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { AppState, FlatList, StyleSheet } from 'react-native'
import { setFocusHandler, useInfiniteQuery } from 'react-query'

import TimelineNotifications from 'src/components/Timelines/Timeline/Notifications'
import TimelineDefault from 'src/components/Timelines/Timeline/Default'
import TimelineConversation from 'src/components/Timelines/Timeline/Conversation'
import { timelineFetch } from 'src/utils/fetches/timelineFetch'
import TimelineSeparator from './Timeline/Separator'
import TimelineEmpty from './Timeline/Empty'
import TimelineEnd from './Timeline/Shared/End'

export interface Props {
  page: App.Pages
  hashtag?: string
  list?: string
  toot?: Mastodon.Status
  account?: string
  disableRefresh?: boolean
  scrollEnabled?: boolean
}

const Timeline: React.FC<Props> = ({
  page,
  hashtag,
  list,
  toot,
  account,
  disableRefresh = false,
  scrollEnabled = true
}) => {
  setFocusHandler(handleFocus => {
    const handleAppStateChange = (appState: string) => {
      if (appState === 'active') {
        handleFocus()
      }
    }
    AppState.addEventListener('change', handleAppStateChange)
    return () => AppState.removeEventListener('change', handleAppStateChange)
  })

  const queryKey: App.QueryKey = [
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
    isSuccess,
    isLoading,
    isError,
    isFetchingMore,
    canFetchMore,
    data,
    fetchMore,
    refetch
  } = useInfiniteQuery(queryKey, timelineFetch, {
    getFetchMore: (last, all) => {
      const allLastGroup = all[all.length - 1]!
      return (
        last?.toots.length > 0 &&
        allLastGroup.toots[allLastGroup.toots.length - 1].id !==
          last?.toots[last?.toots.length - 1].id
      )
    }
  })
  const flattenData = data ? data.flatMap(d => [...d?.toots]) : []
  const flattenPointer = data ? data.flatMap(d => [d?.pointer]) : []

  const flRef = useRef<FlatList>(null)
  useEffect(() => {
    if (toot && isSuccess) {
      setTimeout(() => {
        flRef.current?.scrollToIndex({
          index: flattenPointer[0],
          viewOffset: 100
        })
      }, 500)
    }
  }, [isSuccess])

  const flKeyExtrator = useCallback(({ id }) => id, [])
  const flRenderItem = useCallback(({ item }) => {
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
    () => (
      <TimelineEmpty
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
      />
    ),
    [isLoading, isError]
  )
  const flOnRefresh = useCallback(
    () =>
      !disableRefresh &&
      fetchMore(
        {
          direction: 'prev',
          id: flattenData[0].id
        },
        { previous: true }
      ),
    [flattenData]
  )
  const flOnEndReach = useCallback(
    () =>
      !disableRefresh &&
      canFetchMore &&
      fetchMore({
        direction: 'next',
        id: flattenData[flattenData.length - 1].id
      }),
    [flattenData]
  )
  const flFooter = useCallback(() => {
    return <TimelineEnd isFetchingMore={isFetchingMore} />
    // if (isFetchingMore) {
    //   return <ActivityIndicator />
    // } else {
    //   return <TimelineEnd />
    // }
  }, [isFetchingMore])
  const onScrollToIndexFailed = useCallback(error => {
    const offset = error.averageItemLength * error.index
    flRef.current?.scrollToOffset({ offset })
    setTimeout(
      () =>
        flRef.current?.scrollToIndex({ index: error.index, viewOffset: 100 }),
      350
    )
  }, [])

  return (
    <FlatList
      ref={flRef}
      data={flattenData}
      style={styles.flatList}
      onRefresh={flOnRefresh}
      renderItem={flRenderItem}
      onEndReached={flOnEndReach}
      keyExtractor={flKeyExtrator}
      scrollEnabled={scrollEnabled} // For timeline in Account view
      ListFooterComponent={flFooter}
      ListEmptyComponent={flItemEmptyComponent}
      ItemSeparatorComponent={flItemSeparatorComponent}
      onEndReachedThreshold={!disableRefresh ? 0.75 : null}
      refreshing={!disableRefresh && isLoading && flattenData.length > 0}
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
