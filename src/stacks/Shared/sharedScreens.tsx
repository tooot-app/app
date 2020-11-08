import React from 'react'

import Account from 'src/stacks/Shared/Account'
import Hashtag from 'src/stacks/Shared/Hashtag'
import Toot from 'src/stacks/Shared/Toot'
import Webview from 'src/stacks/Shared/Webview'
import PostToot from './PostToot'

const sharedScreens = (Stack: any) => {
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
      options={({ route }: any) => ({
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
    />,
    <Stack.Screen
      key='PostToot'
      name='PostToot'
      component={PostToot}
      options={{
        stackPresentation: 'fullScreenModal'
      }}
    />
  ]
}

export default sharedScreens
