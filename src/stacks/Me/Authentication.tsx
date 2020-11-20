import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'

import Instance from './Authentication/Instance'

const Stack = createNativeStackNavigator()

export type ScreenMeAuthentication = {
  'Me-Authentication-Instance': undefined
}

const Base = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name='Me-Authentication-Instance' component={Instance} />
    </Stack.Navigator>
  )
}

export default Base
