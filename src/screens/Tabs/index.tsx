import GracefullyImage from '@components/GracefullyImage'
import haptics from '@components/haptics'
import Icon from '@components/Icon'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { RootStackScreenProps, ScreenTabsStackParamList } from '@utils/navigation/navigators'
import { getGlobalStorage, useAccountStorage, useGlobalStorage } from '@utils/storage/actions'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useMemo } from 'react'
import { Platform } from 'react-native'
import TabLocal from './Local'
import TabMe from './Me'
import TabNotifications from './Notifications'
import TabPublic from './Public'

const Tab = createBottomTabNavigator<ScreenTabsStackParamList>()

const ScreenTabs = ({ navigation }: RootStackScreenProps<'Screen-Tabs'>) => {
  const { colors } = useTheme()

  const accountActive = useGlobalStorage.string('account.active')
  const [avatarStatic] = useAccountStorage.string('auth.account.avatar_static')

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

  const previousTab = getGlobalStorage.string('app.prev_tab')

  return (
    <Tab.Navigator
      initialRouteName={accountActive ? previousTab : 'Tab-Me'}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDefault,
        tabBarInactiveTintColor: colors.secondary,
        tabBarShowLabel: false,
        ...(Platform.OS === 'android' && { tabBarHideOnKeyboard: true }),
        tabBarStyle: { display: accountActive ? 'flex' : 'none' },
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
                  uri={{ original: avatarStatic }}
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
      })}
    >
      <Tab.Screen name='Tab-Local' component={TabLocal} />
      <Tab.Screen name='Tab-Public' component={TabPublic} />
      <Tab.Screen name='Tab-Compose' component={composeComponent} listeners={composeListeners} />
      <Tab.Screen name='Tab-Notifications' component={TabNotifications} />
      <Tab.Screen name='Tab-Me' component={TabMe} listeners={meListeners} />
    </Tab.Navigator>
  )
}

export default ScreenTabs
