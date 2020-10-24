import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'

import TootTimeline from 'src/components/TootTimeline'
import { fetch, getToots, getStatus } from './timelineSlice'

const Default = ({ toots, status, remote, endpoint, local }) => {
  return (
    <>
      <FlatList
        data={toots}
        keyExtractor={({ id }) => id}
        renderItem={TootTimeline}
        onRefresh={() =>
          dispatch(
            fetch({ remote, endpoint, local, id: toots[0].id, newer: true })
          )
        }
        refreshing={status === 'loading'}
        onEndReached={() =>
          dispatch(
            fetch({ remote, endpoint, local, id: toots[toots.length - 1].id })
          )
        }
        onEndReachedThreshold={0.5}
        style={{ height: '100%', width: '100%' }}
      />
      {status === 'loading' && <ActivityIndicator />}
    </>
  )
}

const Notifications = ({ toots, status, endpoint }) => {
  return (
    <>
      <FlatList
        data={toots}
        keyExtractor={({ status: { id } }) => id}
        renderItem={({ item }) => (
          <TootTimeline item={item} notification={true} />
        )}
        // onRefresh={() =>
        //   dispatch(fetch({ endpoint, id: toots[0].status.id, newer: true }))
        // }
        // refreshing={status === 'loading'}
        // onEndReached={() =>
        //   dispatch(fetch({ endpoint, id: toots[toots.length - 1].status.id }))
        // }
        onEndReachedThreshold={0.5}
        style={{ height: '100%', width: '100%' }}
      />
      {status === 'loading' && <ActivityIndicator />}
    </>
  )
}

export default function Timeline ({ remote, endpoint, local }) {
  const dispatch = useDispatch()
  const toots = useSelector(state =>
    getToots(state)({ remote, endpoint, local })
  )
  const status = useSelector(state =>
    getStatus(state)({ remote, endpoint, local })
  )

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetch({ remote, endpoint, local }))
    }
  }, [status, dispatch])

  let content
  if (status === 'error') {
    content = <Text>Error message</Text>
  } else {
    if (endpoint === 'notifications') {
      content = (
        <Notifications toots={toots} status={status} endpoint={endpoint} />
      )
    } else {
      content = (
        <Default
          toots={toots}
          status={status}
          remote={remote}
          endpoint={endpoint}
          local={local}
        />
      )
    }
  }

  return <View>{content}</View>
}

Timeline.propTypes = {
  remote: PropTypes.bool,
  endpoint: PropTypes.string,
  local: PropTypes.bool
}
