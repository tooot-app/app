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
import ScreenMeSettingsFontsize from './Me/Fontsize'
import ScreenMeSettingsPush from './Me/Push'

const Stack = createNativeStackNavigator<Nav.TabMeStackParamList>()

const TabMe = React.memo(
  () => {
    const { t } = useTranslation('screenTabs')

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
            headerTitle: t('me.stacks.bookmarks.name'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('me.stacks.bookmarks.name')} />
              )
            }),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Conversations'
          component={ScreenMeConversations}
          options={({ navigation }: any) => ({
            headerTitle: t('me.stacks.conversations.name'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('me.stacks.conversations.name')} />
              )
            }),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Favourites'
          component={ScreenMeFavourites}
          options={({ navigation }: any) => ({
            headerTitle: t('me.stacks.favourites.name'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('me.stacks.favourites.name')} />
              )
            }),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Lists'
          component={ScreenMeLists}
          options={({ navigation }: any) => ({
            headerTitle: t('me.stacks.lists.name'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('me.stacks.lists.name')} />
              )
            }),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Lists-List'
          component={ScreenMeListsList}
          options={({ route, navigation }: any) => ({
            headerTitle: t('me.stacks.list.name', { list: route.params.title }),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter
                  content={t('me.stacks.list.name', {
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
            headerTitle: t('me.stacks.settings.name'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('me.stacks.settings.name')} />
              )
            }),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Settings-Fontsize'
          component={ScreenMeSettingsFontsize}
          options={({ navigation }: any) => ({
            headerTitle: t('me.stacks.fontSize.name'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('me.stacks.fontSize.name')} />
              )
            }),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Settings-Push'
          component={ScreenMeSettingsPush}
          options={({ navigation }: any) => ({
            headerTitle: t('me.stacks.push.name'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('me.stacks.push.name')} />
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
