import GracefullyImage from '@components/GracefullyImage'
import haptics from '@components/haptics'
import Icon from '@components/Icon'
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator
} from '@react-navigation/bottom-tabs'
import { useAppDispatch } from '@root/store'
import {
  RootStackScreenProps,
  ScreenTabsStackParamList
} from '@utils/navigation/navigators'
import { getPreviousTab } from '@utils/slices/contextsSlice'
import {
  getInstanceAccount,
  getInstanceActive
} from '@utils/slices/instancesSlice'
import {
  getVersionUpdate,
  retriveVersionLatest
} from '@utils/slices/versionSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useEffect, useMemo } from 'react'
import { Platform } from 'react-native'
import { useSelector } from 'react-redux'
import TabLocal from './Tabs/Local'
import TabMe from './Tabs/Me'
import TabNotifications from './Tabs/Notifications'
import TabPublic from './Tabs/Public'

const Tab = createBottomTabNavigator<ScreenTabsStackParamList>()

const ScreenTabs = React.memo(
  ({ navigation }: RootStackScreenProps<'Screen-Tabs'>) => {
    const { colors, theme } = useTheme()

    const instanceActive = useSelector(getInstanceActive)
    const instanceAccount = useSelector(
      getInstanceAccount,
      (prev, next) => prev?.avatarStatic === next?.avatarStatic
    )

    const screenOptions = useCallback(
      ({ route }): BottomTabNavigationOptions => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDefault,
        tabBarInactiveTintColor: colors.secondary,
        tabBarShowLabel: false,
        ...(Platform.OS === 'android' && { tabBarHideOnKeyboard: true }),
        tabBarStyle: { display: instanceActive !== -1 ? 'flex' : 'none' },
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
                    borderColor: focused ? colors.secondary : color
                  }}
                />
              )
            default:
              return <Icon name='AlertOctagon' size={size} color={color} />
          }
        }
      }),
      [instanceAccount?.avatarStatic, instanceActive, theme]
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

    const meListeners = useMemo(
      () => ({
        tabLongPress: () => {
          haptics('Light')
          //@ts-ignore
          navigation.navigate('Tab-Me', { screen: 'Tab-Me-Root' })
          //@ts-ignore
          navigation.navigate('Tab-Me', { screen: 'Tab-Me-Switch' })
        }
      }),
      []
    )

    const previousTab = useSelector(getPreviousTab, () => true)

    const versionUpdate = useSelector(getVersionUpdate)
    const dispatch = useAppDispatch()
    useEffect(() => {
      dispatch(retriveVersionLatest())
    }, [])
    const tabMeOptions = useMemo(() => {
      if (versionUpdate) {
        return { tabBarBadge: 1 }
      }
    }, [versionUpdate])

    return (
      <Tab.Navigator
        initialRouteName={instanceActive !== -1 ? previousTab : 'Tab-Me'}
        screenOptions={screenOptions}
      >
        <Tab.Screen name='Tab-Local' component={TabLocal} />
        <Tab.Screen name='Tab-Public' component={TabPublic} />
        <Tab.Screen
          name='Tab-Compose'
          component={composeComponent}
          listeners={composeListeners}
        />
        <Tab.Screen name='Tab-Notifications' component={TabNotifications} />
        <Tab.Screen
          name='Tab-Me'
          component={TabMe}
          options={tabMeOptions}
          listeners={meListeners}
        />
      </Tab.Navigator>
    )
  },
  () => true
)

export default ScreenTabs
