import React from 'react'
import { View } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'

import Base from './Me/Base'
import Authentication from 'src/stacks/Me/Authentication'

const Stack = createNativeStackNavigator()

export default function Post () {
  return (
    // <Stack.Navigator>
    //   <Stack.Screen name='Me-Base' component={Base} />
    //   <Stack.Screen
    //     name='Me-Authentication'
    //     component={Authentication}
    //     options={{
    //       stackPresentation: 'modal'
    //     }}
    //   />
    // </Stack.Navigator>
    <View></View>
  )
}
