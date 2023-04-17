import apiInstance from '@utils/api/instance'
import navigationRef from '@utils/navigation/navigationRef'

const pushUseNavigate = (id?: Mastodon.Notification['id']) => {
  navigationRef.navigate('Screen-Tabs', {
    screen: 'Tab-Notifications',
    params: { screen: 'Tab-Notifications-Root', params: {} }
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
      return
    }

    if (body.type === 'follow' || body.type === 'follow_request') {
      if (body.account) {
        navigationRef.navigate('Screen-Tabs', {
          screen: 'Tab-Notifications',
          params: {
            screen: 'Tab-Shared-Account',
            params: { account: body.account }
          }
        })
        return
      }
    }
  })
}

export default pushUseNavigate
