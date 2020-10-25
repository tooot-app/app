import 'react-native-gesture-handler'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { enableScreens } from 'react-native-screens'

import React from 'react'
import { Feather } from '@expo/vector-icons'
import store from 'src/stacks/common/store'
import { Provider } from 'react-redux'
import { StatusBar } from 'expo-status-bar'

import Local from 'src/stacks/Local'
import Public from 'src/stacks/Public'
import Post from 'src/stacks/Post'
import Notifications from 'src/stacks/Notifications'
import Me from 'src/stacks/Me'

enableScreens()
const Tab = createBottomTabNavigator()

export default function Index () {
  return (
    <Provider store={store}>
      <StatusBar style='auto' />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let name
              switch (route.name) {
                case 'Local':
                  name = 'home'
                  break
                case 'Public':
                  name = 'globe'
                  break
                case 'Post':
                  name = 'plus'
                  break
                case 'Notifications':
                  name = 'bell'
                  break
                case 'Me':
                  name = focused ? 'smile' : 'meh'
                  break
              }
              return <Feather name={name} size={size} color={color} />
            }
          })}
          tabBarOptions={{
            activeTintColor: 'black',
            inactiveTintColor: 'gray',
            showLabel: false
          }}
        >
          <Tab.Screen name='Local' component={Local} />
          <Tab.Screen name='Public' component={Public} />
          <Tab.Screen name='Post' component={Post} />
          <Tab.Screen name='Notifications' component={Notifications} />
          <Tab.Screen name='Me' component={Me} />
        </Tab.Navigator>
      </NavigationContainer>
    </Provider>
  )
}
