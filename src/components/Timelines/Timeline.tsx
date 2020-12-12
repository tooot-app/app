import React, { useCallback, useEffect, useRef } from 'react'
import { ActivityIndicator, AppState, FlatList, StyleSheet } from 'react-native'
import { setFocusHandler, useInfiniteQuery } from 'react-query'

import TimelineNotifications from 'src/components/Timelines/Timeline/Notifications'
import TimelineDefault from 'src/components/Timelines/Timeline/Default'
import TimelineConversation from 'src/components/Timelines/Timeline/Conversation'
import { timelineFetch } from 'src/utils/fetches/timelineFetch'
import TimelineSeparator from './Timeline/Separator'
import TimelineEmpty from './Timeline/Empty'

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

  const queryKey: App.QueryKey = [page, { page, hashtag, list, toot, account }]
  const {
    isSuccess,
    isLoading,
    isError,
    isFetchingMore,
    data,
    fetchMore,
    refetch
  } = useInfiniteQuery(queryKey, timelineFetch)
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
        return <TimelineConversation item={item} />
      case 'Notifications':
        return <TimelineNotifications notification={item} queryKey={queryKey} />
      default:
        return <TimelineDefault item={item} queryKey={queryKey} />
    }
  }, [])
  const flItemSeparatorComponent = useCallback(() => <TimelineSeparator />, [])
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
      fetchMore({
        direction: 'next',
        id: flattenData[flattenData.length - 1].id
      }),
    [flattenData]
  )
  const flFooter = useCallback(() => {
    if (isFetchingMore) {
      return <ActivityIndicator />
    } else {
      return null
    }
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
      ListFooterComponent={flFooter}
      scrollEnabled={scrollEnabled} // For timeline in Account view
      ItemSeparatorComponent={flItemSeparatorComponent}
      onEndReachedThreshold={!disableRefresh ? 0.75 : null}
      refreshing={!disableRefresh && isLoading && flattenData.length > 0}
      ListEmptyComponent={
        <TimelineEmpty
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
        />
      }
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
