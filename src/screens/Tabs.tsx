import useWebsocket from '@api/websocket'
import haptics from '@components/haptics'
import Icon from '@components/Icon'
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator
} from '@react-navigation/bottom-tabs'
import { NavigatorScreenParams } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useTimelineQuery } from '@utils/queryHooks/timeline'
import {
  getLocalAccount,
  getLocalActiveIndex,
  getLocalNotification,
  updateLocalNotification
} from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useMemo } from 'react'
import { Platform } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useDispatch, useSelector } from 'react-redux'
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
    const { theme } = useTheme()
    const dispatch = useDispatch()
    const localActiveIndex = useSelector(getLocalActiveIndex)
    const localAccount = useSelector(
      getLocalAccount,
      (prev, next) => prev?.avatarStatic === next?.avatarStatic
    )

    const screenOptions = useCallback(
      ({ route }): BottomTabNavigationOptions => ({
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
              return localActiveIndex !== null ? (
                <FastImage
                  source={{ uri: localAccount?.avatarStatic }}
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size,
                    borderWidth: focused ? 2 : 0,
                    borderColor: focused ? theme.secondary : color
                  }}
                />
              ) : (
                <Icon
                  name={focused ? 'Meh' : 'Smile'}
                  size={size}
                  color={!focused ? theme.secondary : color}
                />
              )
            default:
              return <Icon name='AlertOctagon' size={size} color={color} />
          }
        }
      }),
      [localActiveIndex, localAccount?.avatarStatic]
    )
    const tabBarOptions = useMemo(
      () => ({
        activeTintColor: theme.primary,
        inactiveTintColor:
          localActiveIndex !== null ? theme.secondary : theme.disabled,
        showLabel: false,
        ...(Platform.OS === 'android' && { keyboardHidesTabBar: true })
      }),
      [theme, localActiveIndex]
    )
    const localListeners = useCallback(
      () => ({
        tabPress: (e: any) => {
          if (!(localActiveIndex !== null)) {
            e.preventDefault()
          }
        }
      }),
      [localActiveIndex]
    )
    const composeListeners = useMemo(
      () => ({
        tabPress: (e: any) => {
          e.preventDefault()
          if (localActiveIndex !== null) {
            haptics('Light')
            navigation.navigate('Screen-Compose')
          }
        }
      }),
      [localActiveIndex]
    )
    const composeComponent = useCallback(() => null, [])
    const notificationsListeners = useCallback(
      () => ({
        tabPress: (e: any) => {
          if (!(localActiveIndex !== null)) {
            e.preventDefault()
          }
        }
      }),
      [localActiveIndex]
    )

    // On launch check if there is any unread noficiations
    useTimelineQuery({
      page: 'Notifications',
      options: {
        notifyOnChangeProps: [],
        select: data => {
          if (data.pages[0].body.length) {
            dispatch(
              updateLocalNotification({
                // @ts-ignore
                latestTime: data.pages[0].body[0].created_at
              })
            )
          }
          return data
        }
      }
    })
    useWebsocket({ stream: 'user', event: 'notification' })
    const localNotification = useSelector(
      getLocalNotification,
      (prev, next) =>
        prev?.readTime === next?.readTime &&
        prev?.latestTime === next?.latestTime
    )

    return (
      <Tab.Navigator
        initialRouteName={localActiveIndex !== null ? 'Tab-Local' : 'Tab-Me'}
        screenOptions={screenOptions}
        tabBarOptions={tabBarOptions}
      >
        <Tab.Screen
          name='Tab-Local'
          component={TabLocal}
          listeners={localListeners}
        />
        <Tab.Screen name='Tab-Public' component={TabPublic} />
        <Tab.Screen
          name='Tab-Compose'
          component={composeComponent}
          listeners={composeListeners}
        />
        <Tab.Screen
          name='Tab-Notifications'
          component={TabNotifications}
          listeners={notificationsListeners}
          options={{
            tabBarBadge: localNotification?.latestTime
              ? !localNotification.readTime ||
                new Date(localNotification.readTime) <
                  new Date(localNotification.latestTime)
                ? ''
                : undefined
              : undefined,
            tabBarBadgeStyle: {
              transform: [{ scale: 0.5 }],
              backgroundColor: theme.red
            }
          }}
        />
        <Tab.Screen name='Tab-Me' component={TabMe} />
      </Tab.Navigator>
    )
  },
  () => true
)

export default ScreenTabs
