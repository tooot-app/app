import { Alert } from 'react-native'
import { useSelector } from 'react-redux'

import { client } from 'src/api/client'

export default async function action (type, id) {
  // If header if needed for remote server
  const header = {
    headers: {
      Authorization: `Bearer ${useSelector(
        state => state.instanceInfo.localToken
      )}`
    }
  }
  const instance = `https://${useSelector(
    state => state.instanceInfo.local
  )}/api/v1/`

  let endpoint
  switch (type) {
    case 'favourite':
      endpoint = `${instance}statuses/${id}/favourite`
      break
    case 'unfavourite':
      endpoint = `${instance}statuses/${id}/unfavourite`
      break
    case 'reblog':
      endpoint = `${instance}statuses/${id}/reblog`
      break
    case 'unreblog':
      endpoint = `${instance}statuses/${id}/unreblog`
      break
    case 'bookmark':
      endpoint = `${instance}statuses/${id}/bookmark`
      break
    case 'unbookmark':
      endpoint = `${instance}statuses/${id}/unbookmark`
      break
    case 'mute':
      endpoint = `${instance}statuses/${id}/mute`
      break
    case 'unmute':
      endpoint = `${instance}statuses/${id}/unmute`
      break
    case 'pin':
      endpoint = `${instance}statuses/${id}/pin`
      break
    case 'unpin':
      endpoint = `${instance}statuses/${id}/unpin`
      break
  }

  const res = await client.post(endpoint, [], header)
  console.log(res)

  const alert = {
    title: 'This is a title',
    message: 'This is a message'
  }
  Alert.alert(alert.title, alert.message, [
    { text: 'OK', onPress: () => console.log('OK Pressed') }
  ])
}
