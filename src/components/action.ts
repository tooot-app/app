import { Alert } from 'react-native'

import client from 'src/api/client'

export interface params {
  id: string
}

const action = async ({
  id,
  type,
  stateKey,
  statePrev
}: {
  id: string
  type: 'favourite' | 'reblog' | 'bookmark' | 'mute' | 'pin'
  stateKey: 'favourited' | 'reblogged' | 'bookmarked' | 'muted' | 'pinned'
  statePrev: boolean
}): Promise<void> => {
  const alert = {
    title: 'This is a title',
    message: 'This is a message'
  }

  const res = await client({
    method: 'post',
    instance: 'local',
    endpoint: `statuses/${id}/${statePrev ? 'un' : ''}${type}`
  })

  if (!res.body[stateKey] === statePrev) {
    // Update redux
    console.log('OK!!!')
  } else {
    Alert.alert(alert.title, alert.message, [
      { text: 'OK', onPress: () => console.log('OK Pressed') }
    ])
  }
}

export default action
