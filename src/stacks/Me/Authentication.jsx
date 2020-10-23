import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'

import Instance from './Authentication/Instance'
import Webview from './Authentication/Webview'

const Stack = createNativeStackNavigator()

export default function Base () {
  return (
    <Stack.Navigator>
      <Stack.Screen name='Me-Authentication-Instance' component={Instance} />
      <Stack.Screen name='Me-Authentication-Webview' component={Webview} />
    </Stack.Navigator>
  )
}
