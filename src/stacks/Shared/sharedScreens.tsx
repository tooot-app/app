import React from 'react'

import Account from 'src/stacks/Shared/Account'
import Hashtag from 'src/stacks/Shared/Hashtag'
import Toot from 'src/stacks/Shared/Toot'
import Webview from 'src/stacks/Shared/Webview'

export interface Props {
  Stack: any
}

const sharedScreens = Stack => {
  return [
    <Stack.Screen
      key='Account'
      name='Account'
      component={Account}
      options={{
        headerTranslucent: true,
        headerStyle: { backgroundColor: 'rgba(255, 255, 255, 0)' },
        headerCenter: () => {}
      }}
    />,
    <Stack.Screen
      key='Hashtag'
      name='Hashtag'
      component={Hashtag}
      options={({ route }) => ({
        title: `#${decodeURIComponent(route.params.hashtag)}`
      })}
    />,
    <Stack.Screen
      key='Toot'
      name='Toot'
      component={Toot}
      options={() => ({
        title: '对话'
      })}
    />,
    <Stack.Screen
      key='Webview'
      name='Webview'
      component={Webview}
      // options={({ route }) => ({
      //   title: `${route.params.domain}`
      // })}
    />
  ]
}

export default sharedScreens
