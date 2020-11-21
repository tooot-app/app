import 'react-native-gesture-handler'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { enableScreens } from 'react-native-screens'

import React from 'react'
import { Feather } from '@expo/vector-icons'

// @ts-ignore
import Toast from 'react-native-toast-message'

import ScreenLocal from 'src/screens/Local'
import ScreenPublic from 'src/screens/Public'
import ScreenNotifications from 'src/screens/Notifications'
import ScreenMe from 'src/screens/Me'

enableScreens()
const Tab = createBottomTabNavigator()

export const Index: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let name: string
            switch (route.name) {
              case 'Screen-Local':
                name = 'home'
                break
              case 'Screen-Public':
                name = 'globe'
                break
              case 'Screen-Post':
                name = 'plus'
                break
              case 'Screen-Notifications':
                name = 'bell'
                break
              case 'Screen-Me':
                name = focused ? 'smile' : 'meh'
                break
              default:
                name = 'alert-octagon'
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
        <Tab.Screen name='Screen-Local' component={ScreenLocal} />
        <Tab.Screen name='Screen-Public' component={ScreenPublic} />
        <Tab.Screen
          name='Screen-Post'
          listeners={({ navigation, route }) => ({
            tabPress: e => {
              e.preventDefault()
              const {
                length,
                [length - 1]: last
              } = navigation.dangerouslyGetState().history
              navigation.navigate(last.key.split(new RegExp(/(.*?)-/))[1], {
                screen: 'PostToot'
              })
            }
          })}
        >
          {() => <></>}
        </Tab.Screen>
        <Tab.Screen
          name='Screen-Notifications'
          component={ScreenNotifications}
        />
        <Tab.Screen name='Screen-Me' component={ScreenMe} />
      </Tab.Navigator>

      <Toast ref={(ref: any) => Toast.setRef(ref)} />
    </NavigationContainer>
  )
}
