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
import { getPreviousTab } from '@utils/slices/contextsSlice'
import {
  getInstanceAccount,
  getInstanceActive,
  getInstanceNotification,
  updateInstanceNotification
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
    const { mode, theme } = useTheme()
    const dispatch = useDispatch()
    const instanceActive = useSelector(getInstanceActive)
    const localAccount = useSelector(
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
              return instanceActive !== -1 ? (
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
      [instanceActive, localAccount?.avatarStatic]
    )
    const tabBarOptions = useMemo(
      () => ({
        activeTintColor: theme.primary,
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

    // On launch check if there is any unread noficiations
    useTimelineQuery({
      page: 'Notifications',
      options: {
        enabled: instanceActive !== -1,
        notifyOnChangeProps: [],
        select: data => {
          if (data.pages[0].body.length) {
            dispatch(
              updateInstanceNotification({
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
      getInstanceNotification,
      (prev, next) =>
        prev?.readTime === next?.readTime &&
        prev?.latestTime === next?.latestTime
    )

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
        <Tab.Screen
          name='Tab-Notifications'
          component={TabNotifications}
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
