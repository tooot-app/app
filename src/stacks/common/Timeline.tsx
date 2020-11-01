import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'

import TootNotification from 'src/components/TootNotification'
import TootTimeline from 'src/components/TootTimeline'
import { RootState } from 'src/stacks/common/store'
import { fetch } from './timelineSlice'

// Opening nesting hashtag pages

const Timeline: React.FC<{
  page: store.TimelinePage
  hashtag?: string
  list?: string
  toot?: string
  account?: string
  disableRefresh?: boolean
}> = ({ page, hashtag, list, toot, account, disableRefresh = false }) => {
  const dispatch = useDispatch()
  const state = useSelector((state: RootState) => state.timelines[page])
  const [updateStatus, setUpdateStatus] = useState(false)
  const [timelineReady, setTimelineReady] = useState(false)

  useEffect(() => {
    let mounted = true
    if (state.status === 'idle' && mounted) {
      dispatch(fetch({ page, hashtag, list, toot, account }))
      setTimelineReady(true)
    }
    setUpdateStatus(!updateStatus)
    return () => {
      mounted = false
    }
  }, [state, dispatch])

  let content
  if (state.status === 'failed') {
    content = <Text>Error message</Text>
  } else {
    content = (
      <>
        <FlatList
          style={{ minHeight: '100%' }}
          data={state.toots}
          keyExtractor={({ id }) => id}
          renderItem={({ item, index, separators }) =>
            page === 'Notifications' ? (
              <TootNotification key={index} toot={item} />
            ) : (
              <TootTimeline key={index} toot={item} />
            )
          }
          // {...(state.pointer && { initialScrollIndex: state.pointer })}
          {...(!disableRefresh && {
            onRefresh: () =>
              dispatch(
                fetch({
                  page,
                  hashtag,
                  list,
                  paginationDirection: 'prev'
                })
              ),
            refreshing: state.status === 'loading',
            onEndReached: () => {
              if (!timelineReady) {
                dispatch(
                  fetch({
                    page,
                    hashtag,
                    list,
                    paginationDirection: 'next'
                  })
                )
                setTimelineReady(true)
              }
            },
            onEndReachedThreshold: 0.5
          })}
          onMomentumScrollBegin={() => setTimelineReady(false)}
        />
        {state.status === 'loading' && <ActivityIndicator />}
      </>
    )
  }

  return <View>{content}</View>
}

export default Timeline
