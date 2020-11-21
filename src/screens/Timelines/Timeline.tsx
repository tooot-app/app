import React from 'react'
import { ActivityIndicator, AppState, FlatList, Text, View } from 'react-native'
import { setFocusHandler, useInfiniteQuery } from 'react-query'

import StatusInNotifications from 'src/components/StatusInNotifications'
import StatusInTimeline from 'src/components/StatusInTimeline'
import { timelineFetch } from 'src/utils/fetches/timelineFetch'

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

  const queryKey: App.QueryKey = [
    page,
    { page, hashtag, list, toot, account }
  ]
  const {
    isLoading,
    isFetchingMore,
    isError,
    isSuccess,
    data,
    fetchMore
  } = useInfiniteQuery(queryKey, timelineFetch)
  const flattenData = data ? data.flatMap(d => [...d?.toots]) : []
  // if (page==='Toot'){
  //   console.log(data)
  // }

  let content
  if (!isSuccess) {
    content = <ActivityIndicator />
  } else if (isError) {
    content = <Text>Error message</Text>
  } else {
    content = (
      <>
        <FlatList
          style={{ minHeight: '100%' }}
          scrollEnabled={scrollEnabled} // For timeline in Account view
          data={flattenData}
          keyExtractor={({ id }) => id}
          renderItem={({ item, index, separators }) =>
            page === 'Notifications' ? (
              <StatusInNotifications
                key={index}
                notification={item}
                queryKey={queryKey}
              />
            ) : (
              <StatusInTimeline key={index} status={item} queryKey={queryKey} />
            )
          }
          // {...(state.pointer && { initialScrollIndex: state.pointer })}
          {...(!disableRefresh && {
            onRefresh: () =>
              fetchMore(
                {
                  direction: 'prev',
                  id: flattenData[0].id
                },
                { previous: true }
              ),
            refreshing: isLoading,
            onEndReached: () => {
              fetchMore({
                direction: 'next',
                id: flattenData[flattenData.length - 1].id
              })
            },
            onEndReachedThreshold: 0.5
          })}
        />
        {isFetchingMore && <ActivityIndicator />}
      </>
    )
  }

  return <View>{content}</View>
}

export default Timeline
