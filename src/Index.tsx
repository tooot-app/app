import 'react-native-gesture-handler'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { enableScreens } from 'react-native-screens'

import React from 'react'
import { Feather } from '@expo/vector-icons'
import store from 'src/stacks/common/store'
import { Provider } from 'react-redux'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { StatusBar } from 'expo-status-bar'

import Local from 'src/stacks/Local'
import Public from 'src/stacks/Public'
import PostRoot from 'src/stacks/PostRoot'
import Notifications from 'src/stacks/Notifications'
import Me from 'src/stacks/Me'

enableScreens()
const Tab = createBottomTabNavigator()

export const Index: React.FC = () => {
  return (
    <Provider store={store}>
      <StatusBar style='auto' />

      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let name: string
                switch (route.name) {
                  case 'Local':
                    name = 'home'
                    break
                  case 'Public':
                    name = 'globe'
                    break
                  case 'PostRoot':
                    name = 'plus'
                    break
                  case 'Notifications':
                    name = 'bell'
                    break
                  case 'Me':
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
            <Tab.Screen name='Local' component={Local} />
            <Tab.Screen name='Public' component={Public} />
            <Tab.Screen
              name='PostRoot'
              component={PostRoot}
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
            />
            <Tab.Screen name='Notifications' component={Notifications} />
            <Tab.Screen name='Me' component={Me} />
          </Tab.Navigator>

          <Toast ref={(ref: any) => Toast.setRef(ref)} />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  )
}
