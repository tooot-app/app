import GracefullyImage from '@components/GracefullyImage'
import haptics from '@components/haptics'
import Icon from '@components/Icon'
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator
} from '@react-navigation/bottom-tabs'
import { NavigatorScreenParams } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { getPreviousTab } from '@utils/slices/contextsSlice'
import {
  getInstanceAccount,
  getInstanceActive
} from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useMemo } from 'react'
import { Image, Platform } from 'react-native'
import { useSelector } from 'react-redux'
import TabLocal from './Tabs/Local'
import TabMe from './Tabs/Me'
import TabNotifications from './Tabs/Notifications'
import TabPublic from './Tabs/Public'

export type ScreenTabsParamList = {
  'Tab-Local': NavigatorScreenParams<Nav.TabLocalStackParamList>
  'Tab-Public': NavigatorScreenParams<Nav.TabPublicStackParamList>
  'Tab-Compose': NavigatorScreenParams<Nav.ScreenComposeStackParamList>
  'Tab-Notifications': NavigatorScreenParams<Nav.TabNotificationsStackParamList>
  'Tab-Me': NavigatorScreenParams<Nav.TabMeStackParamList>
}

export type ScreenTabsProp = StackScreenProps<
  Nav.RootStackParamList,
  'Screen-Tabs'
>

const Tab = createBottomTabNavigator<Nav.ScreenTabsStackParamList>()

const ScreenTabs = React.memo(
  ({ navigation }: ScreenTabsProp) => {
    const { mode, theme } = useTheme()

    const instanceActive = useSelector(getInstanceActive)
    const instanceAccount = useSelector(
      getInstanceAccount,
      (prev, next) => prev?.avatarStatic === next?.avatarStatic
    )

    const screenOptions = useCallback(
      ({ route }): BottomTabNavigationOptions => ({
        tabBarVisible: instanceActive !== -1,
        tabBarIcon: ({
          focused,
          color,
          size
        }: {
          focused: boolean
          color: string
          size: number
        }) => {
          switch (route.name) {
            case 'Tab-Local':
              return <Icon name='Home' size={size} color={color} />
            case 'Tab-Public':
              return <Icon name='Globe' size={size} color={color} />
            case 'Tab-Compose':
              return <Icon name='Plus' size={size} color={color} />
            case 'Tab-Notifications':
              return <Icon name='Bell' size={size} color={color} />
            case 'Tab-Me':
              return (
                <GracefullyImage
                  key={instanceAccount?.avatarStatic}
                  uri={{ original: instanceAccount?.avatarStatic }}
                  dimension={{
                    width: size,
                    height: size
                  }}
                  style={{
                    borderRadius: size,
                    overflow: 'hidden',
                    borderWidth: focused ? 2 : 0,
                    borderColor: focused ? theme.secondary : color
                  }}
                />
              )
            default:
              return <Icon name='AlertOctagon' size={size} color={color} />
          }
        }
      }),
      [instanceAccount?.avatarStatic, instanceActive]
    )
    const tabBarOptions = useMemo(
      () => ({
        activeTintColor: theme.primaryDefault,
        inactiveTintColor: theme.secondary,
        showLabel: false,
        ...(Platform.OS === 'android' && { keyboardHidesTabBar: true })
      }),
      [mode]
    )
    const composeListeners = useMemo(
      () => ({
        tabPress: (e: any) => {
          e.preventDefault()
          haptics('Light')
          navigation.navigate('Screen-Compose')
        }
      }),
      []
    )
    const composeComponent = useCallback(() => null, [])

    const previousTab = useSelector(getPreviousTab, () => true)

    return (
      <Tab.Navigator
        initialRouteName={instanceActive !== -1 ? previousTab : 'Tab-Me'}
        screenOptions={screenOptions}
        tabBarOptions={tabBarOptions}
      >
        <Tab.Screen name='Tab-Local' component={TabLocal} />
        <Tab.Screen name='Tab-Public' component={TabPublic} />
        <Tab.Screen
          name='Tab-Compose'
          component={composeComponent}
          listeners={composeListeners}
        />
        <Tab.Screen name='Tab-Notifications' component={TabNotifications} />
        <Tab.Screen name='Tab-Me' component={TabMe} />
      </Tab.Navigator>
    )
  },
  () => true
)

export default ScreenTabs
