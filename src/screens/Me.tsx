import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import ScreenMeRoot from 'src/screens/Me/Root'
import ScreenMeConversations from './Me/Cconversations'
import ScreenMeBookmarks from './Me/Bookmarks'
import ScreenMeFavourites from './Me/Favourites'
import ScreenMeLists from './Me/Lists'
import sharedScreens from 'src/screens/Shared/sharedScreens'
import ScreenMeListsList from './Me/Root/Lists/List'
import ScreenMeSettings from './Me/Settings'

import { RootState } from 'src/store'

const Stack = createNativeStackNavigator()

const ScreenMe: React.FC = () => {
  const { t } = useTranslation()
  const localRegistered = useSelector(
    (state: RootState) => state.instances.local.url
  )

  return (
    <Stack.Navigator>
      <Stack.Screen
        name='Screen-Me-Root'
        component={ScreenMeRoot}
        options={
          localRegistered
            ? {
                headerTranslucent: true,
                headerStyle: { backgroundColor: 'rgba(255, 255, 255, 0)' },
                headerCenter: () => <></>
              }
            : { headerTitle: t('headers.me.root') }
        }
      />
      <Stack.Screen
        name='Screen-Me-Conversations'
        component={ScreenMeConversations}
        options={{
          headerTitle: t('headers.me.conversations')
        }}
      />
      <Stack.Screen
        name='Screen-Me-Bookmarks'
        component={ScreenMeBookmarks}
        options={{
          headerTitle: t('headers.me.bookmarks')
        }}
      />
      <Stack.Screen
        name='Screen-Me-Favourites'
        component={ScreenMeFavourites}
        options={{
          headerTitle: t('headers.me.favourites')
        }}
      />
      <Stack.Screen
        name='Screen-Me-Lists'
        component={ScreenMeLists}
        options={{
          headerTitle: t('headers.me.lists.root')
        }}
      />
      <Stack.Screen
        name='Screen-Me-Lists-List'
        component={ScreenMeListsList}
        options={({ route }: any) => ({
          headerTitle: t('headers.me.lists.list', { list: route.params.title })
        })}
      />
      <Stack.Screen
        name='Screen-Me-Settings'
        component={ScreenMeSettings}
        options={{
          headerTitle: t('headers.me.settings.root')
        }}
      />

      {sharedScreens(Stack)}
    </Stack.Navigator>
  )
}

export default ScreenMe
