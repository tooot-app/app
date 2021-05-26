import { HeaderCenter, HeaderLeft } from '@components/Header'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import TabMeBookmarks from './Me/Bookmarks'
import TabMeConversations from './Me/Cconversations'
import TabMeFavourites from './Me/Favourites'
import TabMeLists from './Me/Lists'
import TabMeListsList from './Me/ListsList'
import TabMeProfile from './Me/Profile'
import TabMePush from './Me/Push'
import TabMeRoot from './Me/Root'
import TabMeSettings from './Me/Settings'
import TabMeSettingsFontsize from './Me/SettingsFontsize'
import TabMeSwitch from './Me/Switch'
import sharedScreens from './Shared/sharedScreens'

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
          component={TabMeRoot}
          options={{
            headerTranslucent: true,
            headerStyle: { backgroundColor: 'rgba(255, 255, 255, 0)' },
            headerCenter: () => null
          }}
        />
        <Stack.Screen
          name='Tab-Me-Bookmarks'
          component={TabMeBookmarks}
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
          component={TabMeConversations}
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
          component={TabMeFavourites}
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
          component={TabMeLists}
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
          component={TabMeListsList}
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
          name='Tab-Me-Profile'
          component={TabMeProfile}
          options={{
            stackPresentation: 'modal',
            ...(Platform.OS === 'android' && { headerShown: false })
          }}
        />
        <Stack.Screen
          name='Tab-Me-Push'
          component={TabMePush}
          options={({ navigation }) => ({
            stackPresentation: 'modal',
            headerShown: true,
            headerTitle: t('me.stacks.push.name'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('me.stacks.push.name')} />
              )
            }),
            headerLeft: () => (
              <HeaderLeft
                content='ChevronDown'
                onPress={() => navigation.goBack()}
              />
            )
          })}
        />
        <Stack.Screen
          name='Tab-Me-Settings'
          component={TabMeSettings}
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
          component={TabMeSettingsFontsize}
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
          name='Tab-Me-Switch'
          component={TabMeSwitch}
          options={({ navigation }) => ({
            stackPresentation: 'modal',
            headerShown: true,
            headerTitle: t('me.stacks.switch.name'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('me.stacks.switch.name')} />
              )
            }),
            headerLeft: () => (
              <HeaderLeft
                content='ChevronDown'
                onPress={() => navigation.goBack()}
              />
            )
          })}
        />

        {sharedScreens(Stack as any)}
      </Stack.Navigator>
    )
  },
  () => true
)

export default TabMe
