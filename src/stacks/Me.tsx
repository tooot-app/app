import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'

import Base from './Me/Base'
import Authentication from 'src/stacks/Me/Authentication'

import sharedScreens from 'src/stacks/Shared/sharedScreens'

const Stack = createNativeStackNavigator()

const Me: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name='Me-Base' component={Base} />
      <Stack.Screen
        name='Me-Authentication'
        component={Authentication}
        options={{
          stackPresentation: 'modal'
        }}
      />

      {sharedScreens(Stack)}
    </Stack.Navigator>
  )
}

export default Me
