import React from 'react'
import { View } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'

const Stack = createNativeStackNavigator()

const Post: React.FC = () => {
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

export default Post
