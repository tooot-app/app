import { HeaderCenter, HeaderLeft } from '@components/Header'
import ScreenMeBookmarks from '@screens/Me/Bookmarks'
import ScreenMeConversations from '@screens/Me/Cconversations'
import ScreenMeFavourites from '@screens/Me/Favourites'
import ScreenMeLists from '@screens/Me/Lists'
import ScreenMeRoot from '@screens/Me/Root'
import ScreenMeListsList from '@screens/Me/Root/Lists/List'
import ScreenMeSettings from '@screens/Me/Settings'
import ScreenMeSwitch from '@screens/Me/Switch'
import UpdateRemote from '@screens/Me/UpdateRemote'
import sharedScreens from '@screens/Shared/sharedScreens'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'

const Stack = createNativeStackNavigator<Nav.MeStackParamList>()

const ScreenMe: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Stack.Navigator
      screenOptions={{ headerHideShadow: true, headerTopInsetEnabled: false }}
    >
      <Stack.Screen
        name='Screen-Me-Root'
        component={ScreenMeRoot}
        options={{
          headerTranslucent: true,
          headerStyle: { backgroundColor: 'rgba(255, 255, 255, 0)' },
          headerCenter: () => null
        }}
      />
      <Stack.Screen
        name='Screen-Me-Bookmarks'
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
        name='Screen-Me-Conversations'
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
        name='Screen-Me-Favourites'
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
        name='Screen-Me-Lists'
        component={ScreenMeLists}
        options={({ navigation }: any) => ({
          headerTitle: t('meLists:heading'),
          ...(Platform.OS === 'android' && {
            headerCenter: () => <HeaderCenter content={t('meLists:heading')} />
          }),
          headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
        })}
      />
      <Stack.Screen
        name='Screen-Me-Lists-List'
        component={ScreenMeListsList}
        options={({ route, navigation }: any) => ({
          headerTitle: t('meListsList:heading', { list: route.params.title }),
          ...(Platform.OS === 'android' && {
            headerCenter: () => (
              <HeaderCenter content={t('meListsList:heading')} />
            )
          }),
          headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
        })}
      />
      <Stack.Screen
        name='Screen-Me-Settings'
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
        name='Screen-Me-Settings-UpdateRemote'
        component={UpdateRemote}
        options={({ navigation }: any) => ({
          headerTitle: t('meSettingsUpdateRemote:heading'),
          ...(Platform.OS === 'android' && {
            headerCenter: () => (
              <HeaderCenter content={t('meSettingsUpdateRemote:heading')} />
            )
          }),
          headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
        })}
      />
      <Stack.Screen
        name='Screen-Me-Switch'
        component={ScreenMeSwitch}
        options={({ navigation }: any) => ({
          stackPresentation: 'fullScreenModal',
          headerShown: false,
          headerTitle: t('meSettings:heading'),
          ...(Platform.OS === 'android' && {
            headerCenter: () => (
              <HeaderCenter content={t('meSettings:heading')} />
            )
          }),
          headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
        })}
      />

      {sharedScreens(Stack)}
    </Stack.Navigator>
  )
}

export default ScreenMe
