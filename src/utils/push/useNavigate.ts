import apiInstance from '@api/instance'
import { NavigationContainerRef } from '@react-navigation/native'

const pushUseNavigate = (
  navigationRef: React.RefObject<NavigationContainerRef>,
  id?: Mastodon.Notification['id']
) => {
  navigationRef.current?.navigate('Screen-Tabs', {
    screen: 'Tab-Notifications',
    params: {
      screen: 'Tab-Notifications-Root'
    }
  })

  if (!id) {
    return
  }

  apiInstance<Mastodon.Notification>({
    method: 'get',
    url: `notifications/${id}`
  }).then(({ body }) => {
    if (body.status) {
      navigationRef.current?.navigate('Screen-Tabs', {
        screen: 'Tab-Notifications',
        params: {
          screen: 'Tab-Shared-Toot',
          params: { toot: body.status }
        }
      })
    }
  })
}

export default pushUseNavigate
