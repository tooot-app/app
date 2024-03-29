import GracefullyImage from '@components/GracefullyImage'
import Icon from '@components/Icon'
import haptics from '@components/haptics'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { ScreenTabsStackParamList } from '@utils/navigation/navigators'
import {
  getGlobalStorage,
  getReadableAccounts,
  setAccount,
  useAccountStorage,
  useGlobalStorage
} from '@utils/storage/actions'
import { useTheme } from '@utils/styles/ThemeManager'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { Platform, View } from 'react-native'
import * as ContextMenu from 'zeego/context-menu'
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
                <>
                  <ContextMenu.Root>
                    <ContextMenu.Trigger>
                      <View
                        key={avatarStatic}
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <GracefullyImage
                          sources={{ default: { uri: avatarStatic } }}
                          dimension={{ width: size, height: size }}
                          style={{
                            borderRadius: 99,
                            overflow: 'hidden',
                            borderWidth: focused ? 2 : 0,
                            borderColor: focused ? colors.primaryDefault : color
                          }}
                        />
                        <Icon name='more-vertical' size={size / 1.5} color={colors.secondary} />
                      </View>
                    </ContextMenu.Trigger>

                    <ContextMenu.Content>
                      <ContextMenu.Preview preferredCommitStyle='pop'>
                        {() => (
                          <View
                            key={avatarStatic}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              padding: StyleConstants.Spacing.M
                            }}
                          >
                            <GracefullyImage
                              sources={{ default: { uri: avatarStatic } }}
                              dimension={{ width: size, height: size }}
                              style={{
                                borderRadius: 99,
                                overflow: 'hidden',
                                borderWidth: 2,
                                borderColor: colors.primaryDefault
                              }}
                            />
                          </View>
                        )}
                      </ContextMenu.Preview>

                      {getReadableAccounts().map(account => (
                        <ContextMenu.CheckboxItem
                          key={account.key}
                          value={account.active ? 'on' : 'off'}
                          disabled={account.active}
                          onValueChange={async () => {
                            if (!account.active) {
                              await setAccount(account.key)
                            }
                          }}
                        >
                          <ContextMenu.ItemTitle children={account.acct} />
                        </ContextMenu.CheckboxItem>
                      ))}
                    </ContextMenu.Content>
                  </ContextMenu.Root>
                </>
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
      <Tab.Screen name='Tab-Me' component={TabMe} />
    </Tab.Navigator>
  )
}

export default ScreenTabs
