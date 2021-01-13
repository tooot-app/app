import client from '@api/client'
import haptics from '@components/haptics'
import Icon from '@components/Icon'
import { toast, toastConfig } from '@components/toast'
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator
} from '@react-navigation/bottom-tabs'
import {
  NavigationContainer,
  NavigationContainerRef
} from '@react-navigation/native'
import ScreenLocal from '@screens/Local'
import ScreenMe from '@screens/Me'
import ScreenNotifications from '@screens/Notifications'
import ScreenPublic from '@screens/Public'
import { useTimelineQuery } from '@utils/queryHooks/timeline'
import {
  getLocalActiveIndex,
  getLocalNotification,
  localUpdateAccountPreferences,
  localUpdateNotification
} from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import { themes } from '@utils/styles/themes'
import * as Analytics from 'expo-firebase-analytics'
import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef
} from 'react'
import { StatusBar } from 'react-native'
import Toast from 'react-native-toast-message'
import { useDispatch, useSelector } from 'react-redux'

const Tab = createBottomTabNavigator<Nav.RootStackParamList>()

export interface Props {
  localCorrupt?: string
}

export const navigationRef = createRef<NavigationContainerRef>()

const Index: React.FC<Props> = ({ localCorrupt }) => {
  const dispatch = useDispatch()
  const localActiveIndex = useSelector(getLocalActiveIndex)
  const { mode, theme } = useTheme()
  enum barStyle {
    light = 'dark-content',
    dark = 'light-content'
  }

  const routeNameRef = useRef<string | undefined>()

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
    localActiveIndex !== null &&
      client<Mastodon.Announcement[]>({
        method: 'get',
        instance: 'local',
        url: `announcements`
      })
        .then(res => {
          if (res?.filter(announcement => !announcement.read).length) {
            navigationRef.current?.navigate('Screen-Shared-Announcements', {
              showAll: false
            })
          }
        })
        .catch(() => {})
  }, [])

  // On launch check if there is any unread noficiations
  const queryNotification = useTimelineQuery({
    page: 'Notifications',
    options: {
      enabled: localActiveIndex !== null ? true : false,
      refetchInterval: 1000 * 60,
      refetchIntervalInBackground: true
    }
  })
  const prevNotification = useSelector(getLocalNotification)
  useEffect(() => {
    if (queryNotification.data?.pages) {
      const flattenData = queryNotification.data.pages.flatMap(d => [...d])
      const latestNotificationTime = flattenData.length
        ? (flattenData[0] as Mastodon.Notification).created_at
        : undefined

      if (!prevNotification || !prevNotification.latestTime) {
        dispatch(
          localUpdateNotification({
            unread: true
          })
        )
      } else if (
        latestNotificationTime &&
        new Date(prevNotification.latestTime) < new Date(latestNotificationTime)
      ) {
        dispatch(
          localUpdateNotification({
            unread: true,
            latestTime: latestNotificationTime
          })
        )
      }
    }
  }, [queryNotification.data?.pages])

  // Lazily update users's preferences, for e.g. composing default visibility
  useEffect(() => {
    if (localActiveIndex !== null) {
      dispatch(localUpdateAccountPreferences())
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
      inactiveTintColor:
        localActiveIndex !== null ? theme.secondary : theme.disabled,
      showLabel: false
    }),
    [theme, localActiveIndex]
  )
  const tabScreenLocalListeners = useCallback(
    () => ({
      tabPress: (e: any) => {
        if (!(localActiveIndex !== null)) {
          e.preventDefault()
        }
      }
    }),
    [localActiveIndex]
  )
  const tabScreenComposeListeners = useMemo(
    () => ({
      tabPress: (e: any) => {
        e.preventDefault()
        if (localActiveIndex !== null) {
          haptics('Medium')
          navigationRef.current?.navigate('Screen-Shared-Compose')
        }
      }
    }),
    [localActiveIndex]
  )
  const tabScreenComposeComponent = useCallback(() => null, [])
  const tabScreenNotificationsListeners = useCallback(
    () => ({
      tabPress: (e: any) => {
        if (!(localActiveIndex !== null)) {
          e.preventDefault()
        }
      }
    }),
    [localActiveIndex]
  )
  return (
    <>
      <StatusBar barStyle={barStyle[mode]} backgroundColor={theme.background} />
      <NavigationContainer
        ref={navigationRef}
        theme={themes[mode]}
        onReady={navigationContainerOnReady}
        onStateChange={navigationContainerOnStateChange}
      >
        <Tab.Navigator
          initialRouteName={
            localActiveIndex !== null ? 'Screen-Local' : 'Screen-Public'
          }
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
            options={
              prevNotification && prevNotification.unread
                ? {
                    tabBarBadge: '',
                    tabBarBadgeStyle: {
                      transform: [{ scale: 0.5 }],
                      backgroundColor: theme.red
                    }
                  }
                : {
                    tabBarBadgeStyle: {
                      transform: [{ scale: 0.5 }],
                      backgroundColor: theme.red
                    }
                  }
            }
          />
          <Tab.Screen name='Screen-Me' component={ScreenMe} />
        </Tab.Navigator>

        {/* <Toast ref={Toast.setRef} config={toastConfig} /> */}
      </NavigationContainer>
    </>
  )
}

export default React.memo(Index, () => true)
