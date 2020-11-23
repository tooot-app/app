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

import { themes } from 'src/utils/styles/themes'
import { useTheme } from 'src/utils/styles/ThemeManager'
import getCurrentTab from 'src/utils/getCurrentTab'

enableScreens()
const Tab = createBottomTabNavigator<RootStackParamList>()

export type RootStackParamList = {
  'Screen-Local': undefined
  'Screen-Public': { publicTab: boolean }
  'Screen-Post': undefined
  'Screen-Notifications': undefined
  'Screen-Me': undefined
}

export const Index: React.FC = () => {
  const { mode, theme } = useTheme()

  return (
    <NavigationContainer theme={themes[mode]}>
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
          activeTintColor: theme.primary,
          inactiveTintColor: theme.secondary,
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
              navigation.navigate(getCurrentTab(navigation), {
                screen: 'Screen-Shared-Compose'
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
