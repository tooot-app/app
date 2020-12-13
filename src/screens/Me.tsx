import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import ScreenMeRoot from '@screens/Me/Root'
import ScreenMeConversations from '@screens/Me/Cconversations'
import ScreenMeBookmarks from '@screens/Me/Bookmarks'
import ScreenMeFavourites from '@screens/Me/Favourites'
import ScreenMeLists from '@screens/Me/Lists'
import sharedScreens from '@screens/Shared/sharedScreens'
import ScreenMeListsList from '@screens/Me/Root/Lists/List'
import ScreenMeSettings from '@screens/Me/Settings'

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
          // localRegistered ?
          {
            headerTranslucent: true,
            headerStyle: { backgroundColor: 'rgba(255, 255, 255, 0)' },
            headerCenter: () => <></>
          }
          // : { headerTitle: t('meRoot:heading') }
        }
      />
      <Stack.Screen
        name='Screen-Me-Conversations'
        component={ScreenMeConversations}
        options={{
          headerTitle: t('meConversations:heading')
        }}
      />
      <Stack.Screen
        name='Screen-Me-Bookmarks'
        component={ScreenMeBookmarks}
        options={{
          headerTitle: t('meBookmarks:heading')
        }}
      />
      <Stack.Screen
        name='Screen-Me-Favourites'
        component={ScreenMeFavourites}
        options={{
          headerTitle: t('meFavourites:heading')
        }}
      />
      <Stack.Screen
        name='Screen-Me-Lists'
        component={ScreenMeLists}
        options={{
          headerTitle: t('meLists:heading')
        }}
      />
      <Stack.Screen
        name='Screen-Me-Lists-List'
        component={ScreenMeListsList}
        options={({ route }: any) => ({
          headerTitle: t('meListsList:heading', { list: route.params.title })
        })}
      />
      <Stack.Screen
        name='Screen-Me-Settings'
        component={ScreenMeSettings}
        options={{
          headerTitle: t('meSettings:heading')
        }}
      />

      {sharedScreens(Stack)}
    </Stack.Navigator>
  )
}

export default ScreenMe
