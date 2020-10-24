import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { connect, useSelector, useDispatch } from 'react-redux'

import TootTimeline from 'src/components/TootTimeline'
import { fetch, getToots, getStatus } from './timelineSlice'

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
    content = (
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

  return <View>{content}</View>
}

Timeline.propTypes = {
  remote: PropTypes.bool,
  endpoint: PropTypes.string.isRequired,
  local: PropTypes.bool
}
