import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { useTranslation } from 'react-i18next'

import ScreenMeRoot from '@screens/Me/Root'
import ScreenMeConversations from '@screens/Me/Cconversations'
import ScreenMeBookmarks from '@screens/Me/Bookmarks'
import ScreenMeFavourites from '@screens/Me/Favourites'
import ScreenMeLists from '@screens/Me/Lists'
import sharedScreens from '@screens/Shared/sharedScreens'
import ScreenMeListsList from '@screens/Me/Root/Lists/List'
import ScreenMeSettings from '@screens/Me/Settings'

import { HeaderLeft } from '@root/components/Header'

const Stack = createNativeStackNavigator()

const ScreenMe: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Stack.Navigator screenOptions={{ headerHideShadow: true }}>
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
        name='Screen-Me-Conversations'
        component={ScreenMeConversations}
        options={({ navigation }: any) => ({
          headerTitle: t('meConversations:heading'),
          headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
        })}
      />
      <Stack.Screen
        name='Screen-Me-Bookmarks'
        component={ScreenMeBookmarks}
        options={({ navigation }: any) => ({
          headerTitle: t('meBookmarks:heading'),
          headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
        })}
      />
      <Stack.Screen
        name='Screen-Me-Favourites'
        component={ScreenMeFavourites}
        options={({ navigation }: any) => ({
          headerTitle: t('meFavourites:heading'),
          headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
        })}
      />
      <Stack.Screen
        name='Screen-Me-Lists'
        component={ScreenMeLists}
        options={({ navigation }: any) => ({
          headerTitle: t('meLists:heading'),
          headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
        })}
      />
      <Stack.Screen
        name='Screen-Me-Lists-List'
        component={ScreenMeListsList}
        options={({ route, navigation }: any) => ({
          headerTitle: t('meListsList:heading', { list: route.params.title }),
          headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
        })}
      />
      <Stack.Screen
        name='Screen-Me-Settings'
        component={ScreenMeSettings}
        options={({ navigation }: any) => ({
          headerTitle: t('meSettings:heading'),
          headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
        })}
      />

      {sharedScreens(Stack)}
    </Stack.Navigator>
  )
}

export default ScreenMe
