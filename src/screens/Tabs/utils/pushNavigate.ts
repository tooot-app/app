import apiInstance from '@api/instance'
import { StackNavigationProp } from '@react-navigation/stack'

const pushNavigate = (
  navigation: StackNavigationProp<Nav.RootStackParamList, 'Screen-Tabs'>,
  id?: Mastodon.Notification['id']
) => {
  // @ts-ignore
  navigation.navigate('Tab-Notifications', {
    screen: 'Tab-Notifications-Root'
  })

  if (!id) {
    return
  }

  apiInstance<Mastodon.Notification>({
    method: 'get',
    url: `notifications/${id}`
  }).then(({ body }) => {
    if (body.status) {
      // @ts-ignore
      navigation.navigate('Tab-Notifications', {
        screen: 'Tab-Shared-Toot',
        params: { toot: body.status }
      })
    }
  })
}

export default pushNavigate
