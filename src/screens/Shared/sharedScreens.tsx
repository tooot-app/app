import { HeaderLeft } from '@root/components/Header'
import ScreenSharedAccount from '@screens/Shared/Account'
import ScreenSharedAnnouncements from '@screens/Shared/Announcement'
import ScreenSharedHashtag from '@screens/Shared/Hashtag'
import ScreenSharedToot from '@screens/Shared/Toot'
import Compose from '@screens/Shared/Compose'
import ComposeEditAttachment from '@screens/Shared/Compose/EditAttachment'
import ScreenSharedSearch from '@screens/Shared/Search'
import React from 'react'
import { useTranslation } from 'react-i18next'

const sharedScreens = (Stack: any) => {
  const { t } = useTranslation()

  return [
    <Stack.Screen
      key='Screen-Shared-Account'
      name='Screen-Shared-Account'
      component={ScreenSharedAccount}
      options={({ navigation }: any) => {
        return {
          headerTranslucent: true,
          headerStyle: {
            backgroundColor: `rgba(255, 255, 255, 0)`
          },
          headerCenter: () => null,
          headerLeft: () => (
            <HeaderLeft
              icon='chevron-left'
              onPress={() => navigation.goBack()}
            />
          )
        }
      }}
    />,
    <Stack.Screen
      key='Screen-Shared-Hashtag'
      name='Screen-Shared-Hashtag'
      component={ScreenSharedHashtag}
      options={({ route, navigation }: any) => ({
        title: `#${decodeURIComponent(route.params.hashtag)}`,
        headerLeft: () => (
          <HeaderLeft icon='chevron-left' onPress={() => navigation.goBack()} />
        )
      })}
    />,
    <Stack.Screen
      key='Screen-Shared-Toot'
      name='Screen-Shared-Toot'
      component={ScreenSharedToot}
      options={({ navigation }: any) => ({
        title: t('sharedToot:heading'),
        headerLeft: () => (
          <HeaderLeft icon='chevron-left' onPress={() => navigation.goBack()} />
        )
      })}
    />,
    <Stack.Screen
      key='Screen-Shared-Compose'
      name='Screen-Shared-Compose'
      component={Compose}
      options={{
        stackPresentation: 'fullScreenModal'
      }}
    />,
    <Stack.Screen
      key='Screen-Shared-Compose-EditAttachment'
      name='Screen-Shared-Compose-EditAttachment'
      component={ComposeEditAttachment}
      options={{
        stackPresentation: 'modal'
      }}
    />,
    <Stack.Screen
      key='Screen-Shared-Search'
      name='Screen-Shared-Search'
      component={ScreenSharedSearch}
      options={{
        stackPresentation: 'modal'
      }}
    />,
    <Stack.Screen
      key='Screen-Shared-Announcements'
      name='Screen-Shared-Announcements'
      component={ScreenSharedAnnouncements}
      options={{
        stackPresentation: 'transparentModal',
        stackAnimation: 'fade'
      }}
    />
  ]
}

export default sharedScreens
