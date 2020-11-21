import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'

import ScreenMeRoot from 'src/screens/Me/Root'
import sharedScreens from 'src/screens/Shared/sharedScreens'

const Stack = createNativeStackNavigator()

const ScreenMe: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name='Screen-Me-Root' component={ScreenMeRoot} />

      {sharedScreens(Stack)}
    </Stack.Navigator>
  )
}

export default ScreenMe
