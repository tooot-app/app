import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'

import TootTimeline from 'src/components/TootTimeline'
import { fetch, getToots, getStatus } from './timelineSlice'

const Default = ({ dispatch, toots, status, timeline }) => {
  return (
    <>
      <FlatList
        data={toots}
        keyExtractor={({ id }) => id}
        renderItem={TootTimeline}
        onRefresh={() =>
          dispatch(fetch({ ...timeline, id: toots[0].id, newer: true }))
        }
        refreshing={status === 'loading'}
        onEndReached={() =>
          dispatch(fetch({ ...timeline, id: toots[toots.length - 1].id }))
        }
        onEndReachedThreshold={0.5}
      />
      {status === 'loading' && <ActivityIndicator />}
    </>
  )
}

const Notifications = ({ dispatch, toots, status, timeline }) => {
  return (
    <>
      <FlatList
        data={toots}
        keyExtractor={({ status: { id } }) => id}
        renderItem={({ item }) => (
          <TootTimeline item={item} notification={true} />
        )}
        onRefresh={() =>
          dispatch(fetch({ ...timeline, id: toots[0].id, newer: true }))
        }
        refreshing={status === 'loading'}
        onEndReached={() =>
          dispatch(fetch({ ...timeline, id: toots[toots.length - 1].id }))
        }
        onEndReachedThreshold={0.5}
      />
      {status === 'loading' && <ActivityIndicator />}
    </>
  )
}

export default function Timeline ({ timeline }) {
  const dispatch = useDispatch()
  const toots = useSelector(state => getToots(state)(timeline))
  const status = useSelector(state => getStatus(state)(timeline))

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetch(timeline))
    }
  }, [status, dispatch])

  let content
  if (status === 'error') {
    content = <Text>Error message</Text>
  } else {
    if (timeline.endpoint === 'notifications') {
      content = (
        <Notifications
          dispatch={dispatch}
          toots={toots}
          status={status}
          timeline={timeline}
        />
      )
    } else {
      content = (
        <Default
          dispatch={dispatch}
          toots={toots}
          status={status}
          timeline={timeline}
        />
      )
    }
  }

  return <View>{content}</View>
}

Timeline.propTypes = {
  timeline: PropTypes.exact({
    remote: PropTypes.bool,
    endpoint: PropTypes.string,
    local: PropTypes.bool
  }).isRequired
}
