import GracefullyImage from '@components/GracefullyImage'
import haptics from '@components/haptics'
import Icon from '@components/Icon'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { ScreenTabsStackParamList } from '@utils/navigation/navigators'
import { getGlobalStorage, useAccountStorage, useGlobalStorage } from '@utils/storage/actions'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Platform, View } from 'react-native'
import TabLocal from './Local'
import TabMe from './Me'
import TabNotifications from './Notifications'
import TabPublic from './Public'

const Tab = createBottomTabNavigator<ScreenTabsStackParamList>()

const ScreenTabs = () => {
  const { colors } = useTheme()

  const [accountActive] = useGlobalStorage.string('account.active')
  const [avatarStatic] = useAccountStorage.string('auth.account.avatar_static')

  return (
    <Tab.Navigator
      initialRouteName={accountActive ? getGlobalStorage.string('app.prev_tab') : 'Tab-Me'}
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
              return <Icon name='home' size={size} color={color} />
            case 'Tab-Public':
              return <Icon name='globe' size={size} color={color} />
            case 'Tab-Compose':
              return <Icon name='plus' size={size} color={color} />
            case 'Tab-Notifications':
              return <Icon name='bell' size={size} color={color} />
            case 'Tab-Me':
              return (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <GracefullyImage
                    uri={{ original: avatarStatic }}
                    dimension={{ width: size, height: size }}
                    style={{
                      borderRadius: size,
                      overflow: 'hidden',
                      borderWidth: focused ? 2 : 0,
                      borderColor: focused ? colors.primaryDefault : color
                    }}
                  />
                  <Icon name='more-vertical' size={size / 1.5} color={colors.secondary} />
                </View>
              )
            default:
              return <Icon name='alert-octagon' size={size} color={color} />
          }
        }
      })}
    >
      <Tab.Screen name='Tab-Local' component={TabLocal} />
      <Tab.Screen name='Tab-Public' component={TabPublic} />
      <Tab.Screen
        name='Tab-Compose'
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault()
            haptics('Light')
            navigation.navigate('Screen-Compose')
          }
        })}
      >
        {() => null}
      </Tab.Screen>
      <Tab.Screen name='Tab-Notifications' component={TabNotifications} />
      <Tab.Screen
        name='Tab-Me'
        component={TabMe}
        listeners={({ navigation }) => ({
          tabLongPress: () => {
            haptics('Light')
            navigation.navigate('Tab-Me', { screen: 'Tab-Me-Root' })
            navigation.navigate('Tab-Me', { screen: 'Tab-Me-Switch' })
          }
        })}
      />
    </Tab.Navigator>
  )
}

export default ScreenTabs
