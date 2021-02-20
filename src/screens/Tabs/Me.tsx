import { HeaderCenter, HeaderLeft } from '@components/Header'
import ScreenMeBookmarks from '@screens/Tabs/Me/Bookmarks'
import ScreenMeConversations from '@screens/Tabs/Me/Cconversations'
import ScreenMeFavourites from '@screens/Tabs/Me/Favourites'
import ScreenMeLists from '@screens/Tabs/Me/Lists'
import ScreenMeRoot from '@screens/Tabs/Me/Root'
import ScreenMeListsList from '@screens/Tabs/Me/Root/Lists/List'
import ScreenMeSettings from '@screens/Tabs/Me/Settings'
import ScreenMeSwitch from '@screens/Tabs/Me/Switch'
import sharedScreens from '@screens/Tabs/Shared/sharedScreens'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import ScreenMeSettingsNotification from './Me/Notification'

const Stack = createNativeStackNavigator<Nav.TabMeStackParamList>()

const TabMe = React.memo(
  () => {
    const { t } = useTranslation()

    return (
      <Stack.Navigator
        screenOptions={{ headerHideShadow: true, headerTopInsetEnabled: false }}
      >
        <Stack.Screen
          name='Tab-Me-Root'
          component={ScreenMeRoot}
          options={{
            headerTranslucent: true,
            headerStyle: { backgroundColor: 'rgba(255, 255, 255, 0)' },
            headerCenter: () => null
          }}
        />
        <Stack.Screen
          name='Tab-Me-Bookmarks'
          component={ScreenMeBookmarks}
          options={({ navigation }: any) => ({
            headerTitle: t('meBookmarks:heading'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('meBookmarks:heading')} />
              )
            }),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Conversations'
          component={ScreenMeConversations}
          options={({ navigation }: any) => ({
            headerTitle: t('meConversations:heading'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('meConversations:heading')} />
              )
            }),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Favourites'
          component={ScreenMeFavourites}
          options={({ navigation }: any) => ({
            headerTitle: t('meFavourites:heading'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('meFavourites:heading')} />
              )
            }),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Lists'
          component={ScreenMeLists}
          options={({ navigation }: any) => ({
            headerTitle: t('meLists:heading'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('meLists:heading')} />
              )
            }),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Lists-List'
          component={ScreenMeListsList}
          options={({ route, navigation }: any) => ({
            headerTitle: t('meListsList:heading', { list: route.params.title }),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter
                  content={t('meListsList:heading', {
                    list: route.params.title
                  })}
                />
              )
            }),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Settings'
          component={ScreenMeSettings}
          options={({ navigation }: any) => ({
            headerTitle: t('meSettings:heading'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('meSettings:heading')} />
              )
            }),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Settings-Notification'
          component={ScreenMeSettingsNotification}
          options={({ navigation }: any) => ({
            headerTitle: t('meSettingsNotification:heading'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('meSettingsNotification:heading')} />
              )
            }),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Switch'
          component={ScreenMeSwitch}
          options={{
            stackPresentation: 'modal',
            headerShown: false
          }}
        />

        {sharedScreens(Stack as any)}
      </Stack.Navigator>
    )
  },
  () => true
)

export default TabMe
