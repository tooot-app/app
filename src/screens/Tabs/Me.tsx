import { HeaderLeft } from '@components/Header'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TabMeStackParamList } from '@utils/navigation/navigators'
import React from 'react'
import { useTranslation } from 'react-i18next'
import TabMeBookmarks from './Me/Bookmarks'
import TabMeConversations from './Me/Cconversations'
import TabMeFavourites from './Me/Favourites'
import TabMeFollowedTags from './Me/FollowedTags'
import TabMeList from './Me/List'
import TabMeListAccounts from './Me/List/Accounts'
import TabMeListEdit from './Me/List/Edit'
import TabMeListList from './Me/List/List'
import TabMeProfile from './Me/Profile'
import TabMePush from './Me/Push'
import TabMeRoot from './Me/Root'
import TabMeSettings from './Me/Settings'
import TabMeSettingsFontsize from './Me/SettingsFontsize'
import TabMeSettingsLanguage from './Me/SettingsLanguage'
import TabMeSwitch from './Me/Switch'
import TabShared from './Shared'

const Stack = createNativeStackNavigator<TabMeStackParamList>()

const TabMe = React.memo(
  () => {
    const { t } = useTranslation('screenTabs')

    return (
      <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
        <Stack.Screen
          name='Tab-Me-Root'
          component={TabMeRoot}
          options={{
            headerShadowVisible: false,
            headerStyle: { backgroundColor: 'rgba(255, 255, 255, 0)' },
            headerShown: false
          }}
        />
        <Stack.Screen
          name='Tab-Me-Bookmarks'
          component={TabMeBookmarks}
          options={({ navigation }: any) => ({
            title: t('me.stacks.bookmarks.name'),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Conversations'
          component={TabMeConversations}
          options={({ navigation }: any) => ({
            title: t('me.stacks.conversations.name'),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Favourites'
          component={TabMeFavourites}
          options={({ navigation }: any) => ({
            title: t('me.stacks.favourites.name'),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-FollowedTags'
          component={TabMeFollowedTags}
          options={({ navigation }: any) => ({
            title: t('me.stacks.followedTags.name'),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-List'
          component={TabMeList}
          options={({ route, navigation }: any) => ({
            title: t('me.stacks.list.name', { list: route.params.title }),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-List-Accounts'
          component={TabMeListAccounts}
          options={({ navigation, route: { params } }) => ({
            title: t('me.stacks.listAccounts.name', { list: params.title }),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-List-Edit'
          component={TabMeListEdit}
          options={{
            gestureEnabled: false,
            presentation: 'modal'
          }}
        />
        <Stack.Screen
          name='Tab-Me-List-List'
          component={TabMeListList}
          options={({ navigation }: any) => ({
            title: t('me.stacks.lists.name'),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Profile'
          component={TabMeProfile}
          options={{
            headerShown: false,
            presentation: 'modal'
          }}
        />
        <Stack.Screen
          name='Tab-Me-Push'
          component={TabMePush}
          options={({ navigation }) => ({
            title: t('me.stacks.push.name'),
            headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Settings'
          component={TabMeSettings}
          options={({ navigation }: any) => ({
            title: t('me.stacks.settings.name'),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Settings-Fontsize'
          component={TabMeSettingsFontsize}
          options={({ navigation }: any) => ({
            title: t('me.stacks.fontSize.name'),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Settings-Language'
          component={TabMeSettingsLanguage}
          options={({ navigation }: any) => ({
            title: t('me.stacks.language.name'),
            headerLeft: () => <HeaderLeft onPress={() => navigation.pop(1)} />
          })}
        />
        <Stack.Screen
          name='Tab-Me-Switch'
          component={TabMeSwitch}
          options={({ navigation }) => ({
            presentation: 'modal',
            headerShown: true,
            title: t('me.stacks.switch.name'),
            headerLeft: () => (
              <HeaderLeft content='ChevronDown' onPress={() => navigation.goBack()} />
            )
          })}
        />

        {TabShared({ Stack })}
      </Stack.Navigator>
    )
  },
  () => true
)

export default TabMe
