import React, { useCallback } from 'react'
import {
  ActivityIndicator,
  AppState,
  FlatList,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { setFocusHandler, useInfiniteQuery } from 'react-query'

import TimelineNotifications from 'src/components/Timelines/Timeline/Notifications'
import TimelineDefault from 'src/components/Timelines/Timeline/Default'
import TimelineConversation from 'src/components/Timelines/Timeline/Conversation'
import { timelineFetch } from 'src/utils/fetches/timelineFetch'
import TimelineSeparator from './Timeline/Separator'

// Opening nesting hashtag pages

export interface Props {
  page: App.Pages
  hashtag?: string
  list?: string
  toot?: string
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
    isLoading,
    isFetchingMore,
    isError,
    isSuccess,
    data,
    fetchMore
  } = useInfiniteQuery(queryKey, timelineFetch)
  const flattenData = data ? data.flatMap(d => [...d?.toots]) : []
  // const flattenPointer = data ? data.flatMap(d => [d?.pointer]) : []

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
    [disableRefresh, flattenData]
  )
  const flOnEndReach = useCallback(
    () =>
      !disableRefresh &&
      fetchMore({
        direction: 'next',
        id: flattenData[flattenData.length - 1].id
      }),
    [disableRefresh, flattenData]
  )

  let content
  if (!isSuccess) {
    content = <ActivityIndicator />
  } else if (isError) {
    content = <Text>Error message</Text>
  } else {
    content = (
      <>
        <FlatList
          data={flattenData}
          onRefresh={flOnRefresh}
          renderItem={flRenderItem}
          onEndReached={flOnEndReach}
          keyExtractor={flKeyExtrator}
          style={styles.flatList}
          scrollEnabled={scrollEnabled} // For timeline in Account view
          ItemSeparatorComponent={flItemSeparatorComponent}
          refreshing={!disableRefresh && isLoading}
          onEndReachedThreshold={!disableRefresh ? 1 : null}
          // require getItemLayout
          // {...(flattenPointer[0] && { initialScrollIndex: flattenPointer[0] })}
        />
        {isFetchingMore && <ActivityIndicator />}
      </>
    )
  }

  return <View>{content}</View>
}

const styles = StyleSheet.create({
  flatList: {
    minHeight: '100%'
  }
})

export default Timeline
