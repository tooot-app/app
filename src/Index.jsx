import 'react-native-gesture-handler'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { enableScreens } from 'react-native-screens'
enableScreens()

import React from 'react'
import store from 'src/stacks/common/store'
import { Provider } from 'react-redux'
import { StatusBar } from 'expo-status-bar'

import Main from 'src/stacks/Main'
import Public from 'src/stacks/Public'
import Notifications from 'src/stacks/Notifications'
import Me from 'src/stacks/Me'

const Tab = createBottomTabNavigator()

export default function Index () {
  return (
    <Provider store={store}>
      <StatusBar style='auto' />
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name='Main' component={Main} />
          <Tab.Screen name='Public' component={Public} />
          {/* <Tab.Screen name='Notifications' component={Notifications} /> */}
          <Tab.Screen name='Me' component={Me} />
        </Tab.Navigator>
      </NavigationContainer>
    </Provider>
  )
}
