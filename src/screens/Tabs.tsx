import apiInstance from '@api/instance'
import haptics from '@components/haptics'
import Icon from '@components/Icon'
import { displayMessage } from '@components/Message'
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator
} from '@react-navigation/bottom-tabs'
import { NavigatorScreenParams } from '@react-navigation/native'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { getPreviousTab } from '@utils/slices/contextsSlice'
import {
  getInstanceAccount,
  getInstanceActive,
  getInstances,
  updateInstanceActive
} from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Notifications from 'expo-notifications'
import { findIndex } from 'lodash'
import React, { useCallback, useEffect, useMemo } from 'react'
import { Platform } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useQueryClient } from 'react-query'
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

const convertNotificationToToot = (
  navigation: StackNavigationProp<Nav.RootStackParamList, 'Screen-Tabs'>,
  id: Mastodon.Notification['id']
) => {
  apiInstance<Mastodon.Notification>({
    method: 'get',
    url: `notifications/${id}`
  }).then(({ body }) => {
    // @ts-ignore
    navigation.navigate('Tab-Notifications', {
      screen: 'Tab-Notifications-Root'
    })
    if (body.status) {
      // @ts-ignore
      navigation.navigate('Tab-Notifications', {
        screen: 'Tab-Shared-Toot',
        params: { toot: body.status }
      })
    }
  })
}

const Tab = createBottomTabNavigator<Nav.ScreenTabsStackParamList>()

const ScreenTabs = React.memo(
  ({ navigation }: ScreenTabsProp) => {
    // Push notifications
    const queryClient = useQueryClient()
    const instances = useSelector(
      getInstances,
      (prev, next) => prev.length === next.length
    )
    useEffect(() => {
      const subscription = Notifications.addNotificationReceivedListener(
        notification => {
          const queryKey: QueryKeyTimeline = [
            'Timeline',
            { page: 'Notifications' }
          ]
          queryClient.invalidateQueries(queryKey)
          const payloadData = notification.request.content.data as {
            notification_id?: string
            instanceUrl: string
            accountId: string
          }

          const notificationIndex = findIndex(
            instances,
            instance =>
              instance.url === payloadData.instanceUrl &&
              instance.account.id === payloadData.accountId
          )
          if (notificationIndex !== -1 && payloadData.notification_id) {
            displayMessage({
              duration: 'long',
              message: notification.request.content.title!,
              description: notification.request.content.body!,
              onPress: () =>
                convertNotificationToToot(
                  navigation,
                  // @ts-ignore Typescript is wrong
                  payloadData.notification_id
                )
            })
          }
        }
      )
      return () => subscription.remove()
    }, [instances])
    useEffect(() => {
      const subscription = Notifications.addNotificationResponseReceivedListener(
        ({ notification }) => {
          const payloadData = notification.request.content.data as {
            notification_id?: string
            instanceUrl: string
            accountId: string
          }

          const notificationIndex = findIndex(
            instances,
            instance =>
              instance.url === payloadData.instanceUrl &&
              instance.account.id === payloadData.accountId
          )
          if (notificationIndex !== -1) {
            dispatch(updateInstanceActive(instances[notificationIndex]))
          }
          if (payloadData.notification_id) {
            convertNotificationToToot(navigation, payloadData.notification_id)
          }
        }
      )
      return () => subscription.remove()
    }, [instances])

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
