import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'

import TootTimeline from 'src/components/TootTimeline'
import { fetch, getState } from './timelineSlice'

// Opening nesting hashtag pages

export default function Timeline ({ page, hashtag, list }) {
  const dispatch = useDispatch()
  const state = useSelector(state => getState(state)(page))
  const [timelineReady, setTimelineReady] = useState(false)

  useEffect(() => {
    if (state.status === 'idle') {
      dispatch(fetch({ page, hashtag, list }))
      setTimelineReady(true)
    }
  }, [state, dispatch])

  let content
  if (state.status === 'error') {
    content = <Text>Error message</Text>
  } else {
    content = (
      <>
        <FlatList
          data={state.toots}
          keyExtractor={({ id }) => id}
          renderItem={({ item, index, separators }) => (
            <TootTimeline key={item.key} item={item} />
          )}
          onRefresh={() =>
            dispatch(
              fetch({
                page,
                query: [{ key: 'since_id', value: state.toots[0].id }]
              })
            )
          }
          refreshing={state.status === 'loading'}
          onEndReached={() => {
            if (!timelineReady) {
              dispatch(
                fetch({
                  page,
                  query: [
                    {
                      key: 'max_id',
                      value: state.toots[state.toots.length - 1].id
                    }
                  ]
                })
              )
              setTimelineReady(true)
            }
          }}
          onEndReachedThreshold={0.5}
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
  list: PropTypes.string
}
