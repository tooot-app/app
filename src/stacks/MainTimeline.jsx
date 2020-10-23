import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'

import Timeline from 'src/stacks/common/Timeline'

const MainTimelineStack = createNativeStackNavigator()

function Base () {
  return <Timeline instance='social.xmflsct.com' endpoint='home' />
}

export default function MainTimeline () {
  return (
    <MainTimelineStack.Navigator>
      <MainTimelineStack.Screen name='Base' component={Base} />
    </MainTimelineStack.Navigator>
  )
}
