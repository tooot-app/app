import apiInstance from '@utils/api/instance'
import navigationRef from '@utils/navigation/navigationRef'

const pushUseNavigate = (id?: Mastodon.Notification['id']) => {
  navigationRef.navigate('Screen-Tabs', {
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
      navigationRef.navigate('Screen-Tabs', {
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
