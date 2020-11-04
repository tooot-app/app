import { Dispatch } from '@reduxjs/toolkit'
import { Alert } from 'react-native'

import client from 'src/api/client'
// import { updateStatus } from 'src/stacks/common/timelineSlice'

const action = async ({
  dispatch,
  id,
  type,
  stateKey,
  statePrev
}: {
  dispatch: Dispatch
  id: string
  type: 'favourite' | 'reblog' | 'bookmark' | 'mute' | 'pin'
  stateKey: 'favourited' | 'reblogged' | 'bookmarked' | 'muted' | 'pinned'
  statePrev: boolean
}): Promise<void> => {
  const alert = {
    title: 'This is a title',
    message: 'This is a message'
  }

  // ISSUE: https://github.com/tootsuite/mastodon/issues/3166
  let res = await client({
    method: 'post',
    instance: 'local',
    endpoint: `statuses/${id}/${statePrev ? 'un' : ''}${type}`
  })
  res = await client({
    method: 'post',
    instance: 'local',
    endpoint: `statuses/${id}/${statePrev ? 'un' : ''}${type}`
  })

  if (!res.body[stateKey] === statePrev) {
    // dispatch(updateStatus(res.body))
  } else {
    Alert.alert(alert.title, alert.message, [
      { text: 'OK', onPress: () => console.log('OK Pressed') }
    ])
  }
}

export default action
