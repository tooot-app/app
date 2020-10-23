import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'

import Timeline from 'src/stacks/common/Timeline'

const PublicTimelineStack = createNativeStackNavigator()

function Base () {
  return <Timeline instance='social.xmflsct.com' endpoint='public' local />
}

export default function PublicTimeline () {
  return (
    <PublicTimelineStack.Navigator>
      <PublicTimelineStack.Screen name='Base' component={Base} />
    </PublicTimelineStack.Navigator>
  )
}

// store by page maybe
