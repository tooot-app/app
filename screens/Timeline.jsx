import React, { useEffect } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'

import TootTimeline from '../components/TootTimeline'

import { allToots, fetchNewer, fetchOlder } from './timelineSlice'

export default function ScreenTimeline () {
  const dispatch = useDispatch()
  const toots = useSelector(allToots)

  const fetchNewerStatus = useSelector(state => state.timeline.status)
  const fetchNewerError = useSelector(state => state.timeline.error)
  const fetchOlderStatus = useSelector(state => state.timeline.status)
  const fetchOlderError = useSelector(state => state.timeline.error)

  useEffect(() => {
    if (fetchOlderStatus === 'idle') {
      dispatch(fetchOlder())
    }
  }, [fetchOlderStatus, dispatch])

  let content

  if (fetchOlderStatus === 'error') {
    content = <Text>{fetchOlderError}</Text>
  } else {
    content = (
      <>
        <FlatList
          data={toots}
          keyExtractor={({ id }) => id}
          renderItem={TootTimeline}
          onRefresh={() => dispatch(fetchNewer(toots[0].id))}
          refreshing={fetchNewerStatus === 'loading'}
          onEndReached={() => dispatch(fetchOlder(toots[toots.length - 1].id))}
          onEndReachedThreshold={0.2}
          style={{ height: '100%', width: '100%' }}
        />
        {fetchOlderStatus === 'loading' && <ActivityIndicator />}
      </>
    )
  }

  return <View>{content}</View>
}
