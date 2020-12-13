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
import { useNavigation } from '@react-navigation/native'

const Stack = createNativeStackNavigator()

const ScreenMe: React.FC = () => {
  const navigation = useNavigation()
  const { t } = useTranslation()

  return (
    <Stack.Navigator>
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
        options={{
          headerTitle: t('meConversations:heading'),
          headerLeft: () => (
            <HeaderLeft
              icon='chevron-left'
              onPress={() => navigation.goBack()}
            />
          )
        }}
      />
      <Stack.Screen
        name='Screen-Me-Bookmarks'
        component={ScreenMeBookmarks}
        options={{
          headerTitle: t('meBookmarks:heading'),
          headerLeft: () => (
            <HeaderLeft
              icon='chevron-left'
              onPress={() => navigation.goBack()}
            />
          )
        }}
      />
      <Stack.Screen
        name='Screen-Me-Favourites'
        component={ScreenMeFavourites}
        options={{
          headerTitle: t('meFavourites:heading'),
          headerLeft: () => (
            <HeaderLeft
              icon='chevron-left'
              onPress={() => navigation.goBack()}
            />
          )
        }}
      />
      <Stack.Screen
        name='Screen-Me-Lists'
        component={ScreenMeLists}
        options={{
          headerTitle: t('meLists:heading'),
          headerLeft: () => (
            <HeaderLeft
              icon='chevron-left'
              onPress={() => navigation.goBack()}
            />
          )
        }}
      />
      <Stack.Screen
        name='Screen-Me-Lists-List'
        component={ScreenMeListsList}
        options={({ route }: any) => ({
          headerTitle: t('meListsList:heading', { list: route.params.title }),
          headerLeft: () => (
            <HeaderLeft
              icon='chevron-left'
              onPress={() => navigation.goBack()}
            />
          )
        })}
      />
      <Stack.Screen
        name='Screen-Me-Settings'
        component={ScreenMeSettings}
        options={{
          headerTitle: t('meSettings:heading'),
          headerLeft: () => (
            <HeaderLeft
              icon='chevron-left'
              onPress={() => navigation.goBack()}
            />
          )
        }}
      />

      {sharedScreens(Stack)}
    </Stack.Navigator>
  )
}

export default ScreenMe
