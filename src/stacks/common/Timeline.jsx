import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'

import TootTimeline from 'src/components/TootTimeline'

import genericTimelineSlice from './timelineSlice'

export default function Timeline ({ instance, endpoint, local }) {
  const dispatch = useDispatch()
  const toots = useSelector(genericTimelineSlice(instance).getToots)
  const status = useSelector(genericTimelineSlice(instance).getStatus)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(genericTimelineSlice(instance).fetch({ endpoint, local }))
    }
  }, [status, dispatch])

  let content

  if (status === 'error') {
    content = <Text>Error message</Text>
  } else {
    content = (
      <>
        <FlatList
          data={toots}
          keyExtractor={({ id }) => id}
          renderItem={TootTimeline}
          onRefresh={() =>
            dispatch(
              genericTimelineSlice(instance).fetch({
                endpoint,
                local,
                id: toots[0].id,
                newer: true
              })
            )
          }
          refreshing={status === 'loading'}
          onEndReached={() =>
            dispatch(
              genericTimelineSlice(instance).fetch({
                endpoint,
                local,
                id: toots[toots.length - 1].id
              })
            )
          }
          onEndReachedThreshold={0.5}
          style={{ height: '100%', width: '100%' }}
        />
        {status === 'loading' && <ActivityIndicator />}
      </>
    )
  }

  return <View>{content}</View>
}

Timeline.propTypes = {
  instance: PropTypes.string.isRequired,
  public: PropTypes.bool
}
