import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'

import Following from 'src/stacks/Main/Following'

const MainStack = createNativeStackNavigator()

export default function Main () {
  return (
    <MainStack.Navigator>
      <MainStack.Screen name='Following' component={Following} />
    </MainStack.Navigator>
  )
}
