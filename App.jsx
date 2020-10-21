import 'react-native-gesture-handler'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import React from 'react'
import store from './app/store'
import { Provider } from 'react-redux'
import { StatusBar } from 'expo-status-bar'

import ScreenTimeline from './screens/Timeline'

const Stack = createStackNavigator()

export default function App () {
  return (
    <NavigationContainer>
      <StatusBar style='auto' />
      <Provider store={store}>
        <Stack.Navigator>
          <Stack.Screen name='Timeline' component={ScreenTimeline} />
        </Stack.Navigator>
      </Provider>
    </NavigationContainer>
  )
}
