import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
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
            : { headerTitle: '我的长毛象' }
        }
      />
      <Stack.Screen
        name='Screen-Me-Conversations'
        component={ScreenMeConversations}
        options={{
          headerTitle: '私信'
        }}
      />
      <Stack.Screen
        name='Screen-Me-Bookmarks'
        component={ScreenMeBookmarks}
        options={{
          headerTitle: '书签'
        }}
      />
      <Stack.Screen
        name='Screen-Me-Favourites'
        component={ScreenMeFavourites}
        options={{
          headerTitle: '喜欢'
        }}
      />
      <Stack.Screen
        name='Screen-Me-Lists'
        component={ScreenMeLists}
        options={{
          headerTitle: '列表'
        }}
      />
      <Stack.Screen
        name='Screen-Me-Lists-List'
        component={ScreenMeListsList}
        options={({ route }: any) => ({
          headerTitle: `列表：${route.params.title}`
        })}
      />
      <Stack.Screen
        name='Screen-Me-Settings'
        component={ScreenMeSettings}
        options={{
          headerTitle: '设置'
        }}
      />

      {sharedScreens(Stack)}
    </Stack.Navigator>
  )
}

export default ScreenMe
