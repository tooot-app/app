import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'

import Toot from 'src/components/Toot'
import { fetch } from './timelineSlice'

// Opening nesting hashtag pages

export default function Timeline ({
  page,
  hashtag,
  list,
  toot,
  account,
  disableRefresh
}) {
  const dispatch = useDispatch()
  const state = useSelector(state => state.timelines[page])
  const [timelineReady, setTimelineReady] = useState(false)

  useEffect(() => {
    if (state.status === 'idle') {
      dispatch(fetch({ page, hashtag, list, toot, account }))
      setTimelineReady(true)
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
          renderItem={({ item, index, separators }) => (
            <Toot key={item.key} toot={item} />
          )}
          {...(state.pointer && { initialScrollIndex: state.pointer })}
          {...(!disableRefresh && {
            onRefresh: () =>
              dispatch(fetch({ page, paginationDirection: 'prev' })),
            refreshing: state.status === 'loading',
            onEndReached: () => {
              if (!timelineReady) {
                dispatch(fetch({ page, paginationDirection: 'next' }))
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

Timeline.propTypes = {
  page: PropTypes.string.isRequired,
  hashtag: PropTypes.string,
  list: PropTypes.string,
  toot: PropTypes.string,
  disableRefresh: PropTypes.bool
}
