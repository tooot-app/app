import client from '@api/client'
import Icon from '@components/Icon'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
  NavigationContainer,
  NavigationContainerRef
} from '@react-navigation/native'
import ScreenLocal from '@screens/Local'
import ScreenPublic from '@screens/Public'
import ScreenNotifications from '@screens/Notifications'
import ScreenMe from '@screens/Me'
import { timelineFetch } from '@utils/fetches/timelineFetch'
import {
  getLocalNotification,
  getLocalUrl,
  updateLocalAccountPreferences,
  updateNotification
} from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import { themes } from '@utils/styles/themes'
import { toast, toastConfig } from '@components/toast'
import * as Analytics from 'expo-firebase-analytics'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { StatusBar } from 'react-native'
import Toast from 'react-native-toast-message'
import { useDispatch, useSelector } from 'react-redux'
import { useInfiniteQuery } from 'react-query'

const Tab = createBottomTabNavigator<RootStackParamList>()

export type RootStackParamList = {
  'Screen-Local': undefined
  'Screen-Public': { publicTab: boolean }
  'Screen-Post': undefined
  'Screen-Notifications': undefined
  'Screen-Me': undefined
}

export interface Props {
  localCorrupt?: string
}

const Index: React.FC<Props> = ({ localCorrupt }) => {
  const dispatch = useDispatch()
  const localInstance = useSelector(getLocalUrl)
  const { mode, theme } = useTheme()
  enum barStyle {
    light = 'dark-content',
    dark = 'light-content'
  }

  const routeNameRef = useRef<string | undefined>()
  const navigationRef = useRef<NavigationContainerRef>(null)

  // const isConnected = useNetInfo().isConnected
  // const [firstRender, setFirstRender] = useState(false)
  // useEffect(() => {
  //   if (firstRender) {
  //     // bug in netInfo on first render as false
  //     if (isConnected !== false) {
  //       toast({ type: 'error', content: '手机🈚️网络', autoHide: false })
  //     }
  //   } else {
  //     setFirstRender(true)
  //   }
  // }, [isConnected, firstRender])

  // On launch display login credentials corrupt information
  useEffect(() => {
    const showLocalCorrect = localCorrupt
      ? toast({
          type: 'error',
          message: '登录已过期',
          description: localCorrupt.length ? localCorrupt : undefined,
          autoHide: false
        })
      : undefined
    return showLocalCorrect
  }, [localCorrupt])

  // On launch check if there is any unread announcements
  useEffect(() => {
    console.log('Checking announcements')
    localInstance &&
      client({
        method: 'get',
        instance: 'local',
        url: `announcements`
      })
        .then(({ body }: { body?: Mastodon.Announcement[] }) => {
          if (body?.filter(announcement => !announcement.read).length) {
            navigationRef.current?.navigate('Screen-Shared-Announcements', {
              showAll: false
            })
          }
        })
        .catch(() => {})
  }, [])

  // On launch check if there is any unread noficiations
  const queryNotification = useInfiniteQuery(
    ['Notifications', {}],
    timelineFetch,
    { enabled: localInstance ? true : false }
  )
  const prevNotification = useSelector(getLocalNotification)
  useEffect(() => {
    if (queryNotification.data?.pages) {
      const flattenData = queryNotification.data.pages.flatMap(d => [
        ...d?.toots
      ])
      const latestNotificationTime = flattenData.length
        ? flattenData[0].created_at
        : undefined

      if (!prevNotification || !prevNotification.latestTime) {
        dispatch(
          updateNotification({
            unread: true
          })
        )
      } else if (
        latestNotificationTime &&
        new Date(prevNotification.latestTime) < new Date(latestNotificationTime)
      ) {
        dispatch(
          updateNotification({
            unread: true,
            latestTime: latestNotificationTime
          })
        )
      }
    }
  }, [queryNotification.data?.pages])

  // Lazily update users's preferences, for e.g. composing default visibility
  useEffect(() => {
    if (localInstance) {
      dispatch(updateLocalAccountPreferences())
    }
  }, [])

  // Callbacks
  const navigationContainerOnReady = useCallback(
    () =>
      (routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name),
    []
  )
  const navigationContainerOnStateChange = useCallback(() => {
    const previousRouteName = routeNameRef.current
    const currentRouteName = navigationRef.current?.getCurrentRoute()?.name

    if (previousRouteName !== currentRouteName) {
      Analytics.setCurrentScreen(currentRouteName)
    }

    routeNameRef.current = currentRouteName
  }, [])
  const tabNavigatorScreenOptions = useCallback(
    ({ route }) => ({
      tabBarIcon: ({
        focused,
        color,
        size
      }: {
        focused: boolean
        color: string
        size: number
      }) => {
        let name: any
        let updateColor: string = color
        switch (route.name) {
          case 'Screen-Local':
            name = 'Home'
            break
          case 'Screen-Public':
            name = 'Globe'
            !focused && (updateColor = theme.secondary)
            break
          case 'Screen-Post':
            name = 'Plus'
            break
          case 'Screen-Notifications':
            name = 'Bell'
            break
          case 'Screen-Me':
            name = focused ? 'Meh' : 'Smile'
            !focused && (updateColor = theme.secondary)
            break
          default:
            name = 'AlertOctagon'
            break
        }
        return <Icon name={name} size={size} color={updateColor} />
      }
    }),
    []
  )
  const tabNavigatorTabBarOptions = useMemo(
    () => ({
      activeTintColor: theme.primary,
      inactiveTintColor: localInstance ? theme.secondary : theme.disabled,
      showLabel: false
    }),
    [theme, localInstance]
  )
  const tabScreenLocalListeners = useCallback(
    () => ({
      tabPress: (e: any) => {
        if (!localInstance) {
          e.preventDefault()
        }
      }
    }),
    [localInstance]
  )
  const tabScreenComposeListeners = useCallback(
    ({ navigation }) => ({
      tabPress: (e: any) => {
        e.preventDefault()
        if (localInstance) {
          navigation.navigate('Screen-Shared-Compose')
        }
      }
    }),
    [localInstance]
  )
  const tabScreenComposeComponent = useCallback(() => null, [])
  const tabScreenNotificationsListeners = useCallback(
    () => ({
      tabPress: (e: any) => {
        if (!localInstance) {
          e.preventDefault()
        }
      }
    }),
    [localInstance]
  )
  const tabScreenNotificationsOptions = useMemo(
    () => ({
      tabBarBadge: prevNotification && prevNotification.unread ? '' : undefined,
      tabBarBadgeStyle: {
        transform: [{ scale: 0.5 }],
        backgroundColor: theme.red
      }
    }),
    [theme, prevNotification]
  )

  return (
    <>
      <StatusBar barStyle={barStyle[mode]} />
      <NavigationContainer
        ref={navigationRef}
        theme={themes[mode]}
        onReady={navigationContainerOnReady}
        onStateChange={navigationContainerOnStateChange}
      >
        <Tab.Navigator
          initialRouteName={localInstance ? 'Screen-Local' : 'Screen-Public'}
          screenOptions={tabNavigatorScreenOptions}
          tabBarOptions={tabNavigatorTabBarOptions}
        >
          <Tab.Screen
            name='Screen-Local'
            component={ScreenLocal}
            listeners={tabScreenLocalListeners}
          />
          <Tab.Screen name='Screen-Public' component={ScreenPublic} />
          <Tab.Screen
            name='Screen-Post'
            component={tabScreenComposeComponent}
            listeners={tabScreenComposeListeners}
          />
          <Tab.Screen
            name='Screen-Notifications'
            component={ScreenNotifications}
            listeners={tabScreenNotificationsListeners}
            options={tabScreenNotificationsOptions}
          />
          <Tab.Screen name='Screen-Me' component={ScreenMe} />
        </Tab.Navigator>

        <Toast ref={Toast.setRef} config={toastConfig} />
      </NavigationContainer>
    </>
  )
}

export default React.memo(Index, () => true)
