import 'react-native-gesture-handler'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { enableScreens } from 'react-native-screens'
enableScreens()

import React from 'react'
import store from './app/store'
import { Provider } from 'react-redux'
import { StatusBar } from 'expo-status-bar'

import MainTimeline from 'src/stacks/MainTimeline'
import PublicTimeline from 'src/stacks/PublicTimeline'
import Notifications from 'src/stacks/Notifications'
import Me from 'src/stacks/Me'

const Tab = createBottomTabNavigator()

export default function Main () {
  return (
    <>
    <Provider store={store}>
      <StatusBar style='auto' />
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name='MainTimeline' component={MainTimeline} />
          <Tab.Screen name='PublicTimeline' component={PublicTimeline} />
          {/* <Tab.Screen name='Notifications' component={Notifications} /> */}
          <Tab.Screen name='Me' component={Me} />
        </Tab.Navigator>
      </NavigationContainer>
    </Provider>
    </>
  )
}
