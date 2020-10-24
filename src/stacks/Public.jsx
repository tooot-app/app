import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'

import CurrentPublic from 'src/stacks/Public/CurrentPublic'

const PublicStack = createNativeStackNavigator()

export default function PublicTimeline () {
  return (
    <PublicStack.Navigator>
      <PublicStack.Screen name='CurrentPublic' component={CurrentPublic} />
    </PublicStack.Navigator>
  )
}
