import 'react-native-gesture-handler'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
  NavigationContainer,
  NavigationContainerRef
} from '@react-navigation/native'

import React, { useEffect, useRef, useState } from 'react'
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
import { useDispatch, useSelector } from 'react-redux'
import {
  getLocalNotification,
  getLocalUrl,
  updateLocalAccountPreferences,
  updateNotification
} from '@utils/slices/instancesSlice'
import { useInfiniteQuery } from 'react-query'
import client from './api/client'
import { timelineFetch } from './utils/fetches/timelineFetch'
import { useNetInfo } from '@react-native-community/netinfo'

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
  const dispatch = useDispatch()
  const localInstance = useSelector(getLocalUrl)
  const { i18n } = useTranslation()
  const { mode, theme } = useTheme()
  enum barStyle {
    light = 'dark-content',
    dark = 'light-content'
  }

  const isConnected = useNetInfo().isConnected
  const [firstRender, setFirstRender] = useState(false)
  useEffect(() => {
    if (firstRender) {
      // bug in netInfo on first render as false
      if (isConnected !== false) {
        toast({ type: 'error', content: '手机🈚️网络', autoHide: false })
      }
    } else {
      setFirstRender(true)
    }
  }, [isConnected, firstRender])

  // On launch display login credentials corrupt information
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

  // On launch check if there is any unread announcements
  const navigationRef = useRef<NavigationContainerRef>(null)
  useEffect(() => {
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
    ['Notifications', {}] as QueryKey.Timeline,
    timelineFetch,
    { enabled: localInstance ? true : false, cacheTime: 1000 * 30 }
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

  return (
    <>
      <StatusBar barStyle={barStyle[mode]} />
      <NavigationContainer
        ref={navigationRef}
        theme={themes[mode]}
        key={i18n.language}
      >
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
            listeners={({ navigation }) => ({
              tabPress: e => {
                if (!localInstance) {
                  e.preventDefault()
                }
              }
            })}
          />
          <Tab.Screen name='Screen-Public' component={ScreenPublic} />
          <Tab.Screen
            name='Screen-Post'
            listeners={({ navigation }) => ({
              tabPress: e => {
                e.preventDefault()
                if (localInstance) {
                  navigation.navigate(getCurrentTab(navigation), {
                    screen: 'Screen-Shared-Compose'
                  })
                }
              }
            })}
          >
            {() => null}
          </Tab.Screen>
          <Tab.Screen
            name='Screen-Notifications'
            component={ScreenNotifications}
            options={{
              tabBarBadge:
                prevNotification && prevNotification.unread ? '' : undefined,
              tabBarBadgeStyle: {
                transform: [{ scale: 0.5 }],
                backgroundColor: theme.red
              }
            }}
            listeners={() => ({
              tabPress: e => {
                if (!localInstance) {
                  e.preventDefault()
                }
              }
            })}
          />
          <Tab.Screen name='Screen-Me' component={ScreenMe} />
        </Tab.Navigator>

        <Toast ref={(ref: any) => Toast.setRef(ref)} config={toastConfig} />
      </NavigationContainer>
    </>
  )
}
