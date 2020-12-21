import 'react-native-gesture-handler'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { enableScreens } from 'react-native-screens'

import React, { useEffect } from 'react'
import { StatusBar } from 'react-native'
import Toast from 'react-native-toast-message'
import { Feather } from '@expo/vector-icons'

import ScreenLocal from '@screens/Local'
import ScreenPublic from '@screens/Public'
import ScreenNotifications from '@screens/Notifications'
import ScreenMe from '@screens/Me'

import { themes } from '@utils/styles/themes'
import { useTheme } from '@utils/styles/ThemeManager'
import getCurrentTab from '@utils/getCurrentTab'
import { toast, toastConfig } from '@components/toast'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { getLocalUrl } from './utils/slices/instancesSlice'

enableScreens()
const Tab = createBottomTabNavigator<RootStackParamList>()

export type RootStackParamList = {
  'Screen-Local': undefined
  'Screen-Public': { publicTab: boolean }
  'Screen-Post': undefined
  'Screen-Notifications': undefined
  'Screen-Me': undefined
}

export interface Props {
  localCorrupt: boolean
}

export const Index: React.FC<Props> = ({ localCorrupt }) => {
  const localInstance = useSelector(getLocalUrl)
  const { i18n } = useTranslation()
  const { mode, theme } = useTheme()
  enum barStyle {
    light = 'dark-content',
    dark = 'light-content'
  }

  useEffect(() => {
    const showLocalCorrect = localCorrupt
      ? toast({
          type: 'error',
          content: '登录已过期',
          description: '请重新登录',
          autoHide: false
        })
      : undefined
    return showLocalCorrect
  }, [localCorrupt])

  return (
    <>
      <StatusBar barStyle={barStyle[mode]} />
      <NavigationContainer theme={themes[mode]} key={i18n.language}>
        <Tab.Navigator
          initialRouteName={localInstance ? 'Screen-Local' : 'Screen-Public'}
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let name: any
              let updateColor: string = color
              switch (route.name) {
                case 'Screen-Local':
                  name = 'home'
                  break
                case 'Screen-Public':
                  name = 'globe'
                  !focused && (updateColor = theme.secondary)
                  break
                case 'Screen-Post':
                  name = 'plus'
                  break
                case 'Screen-Notifications':
                  name = 'bell'
                  break
                case 'Screen-Me':
                  name = focused ? 'meh' : 'smile'
                  !focused && (updateColor = theme.secondary)
                  break
                default:
                  name = 'alert-octagon'
                  break
              }
              return <Feather name={name} size={size} color={updateColor} />
            }
          })}
          tabBarOptions={{
            activeTintColor: theme.primary,
            inactiveTintColor: localInstance ? theme.secondary : theme.disabled,
            showLabel: false
          }}
        >
          <Tab.Screen
            name='Screen-Local'
            component={ScreenLocal}
            listeners={{
              tabPress: e => {
                if (!localInstance) {
                  e.preventDefault()
                }
              }
            }}
          />
          <Tab.Screen name='Screen-Public' component={ScreenPublic} />
          <Tab.Screen
            name='Screen-Post'
            listeners={({ navigation, route }) => ({
              tabPress: e => {
                e.preventDefault()
                localInstance &&
                  navigation.navigate(getCurrentTab(navigation), {
                    screen: 'Screen-Shared-Compose'
                  })
              }
            })}
          >
            {() => null}
          </Tab.Screen>
          <Tab.Screen
            name='Screen-Notifications'
            component={ScreenNotifications}
            listeners={{
              tabPress: e => {
                if (!localInstance) {
                  e.preventDefault()
                }
              }
            }}
          />
          <Tab.Screen name='Screen-Me' component={ScreenMe} />
        </Tab.Navigator>

        <Toast ref={(ref: any) => Toast.setRef(ref)} config={toastConfig} />
      </NavigationContainer>
    </>
  )
}
