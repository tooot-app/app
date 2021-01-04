import { HeaderLeft, HeaderRight } from '@components/Header'
import ScreenSharedAccount from '@screens/Shared/Account'
import ScreenSharedAnnouncements from '@screens/Shared/Announcements'
import ScreenSharedHashtag from '@screens/Shared/Hashtag'
import ScreenSharedImagesViewer from '@screens/Shared/ImagesViewer'
import ScreenSharedRelationships from '@screens/Shared/Relationships'
import ScreenSharedToot from '@screens/Shared/Toot'
import Compose from '@screens/Shared/Compose'
import ScreenSharedSearch from '@screens/Shared/Search'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

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
          headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
        }
      }}
    />,
    <Stack.Screen
      key='Screen-Shared-Hashtag'
      name='Screen-Shared-Hashtag'
      component={ScreenSharedHashtag}
      options={({ route, navigation }: any) => ({
        title: `#${decodeURIComponent(route.params.hashtag)}`,
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
      })}
    />,
    <Stack.Screen
      key='Screen-Shared-Toot'
      name='Screen-Shared-Toot'
      component={ScreenSharedToot}
      options={({ navigation }: any) => ({
        title: t('sharedToot:heading'),
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
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
      key='Screen-Shared-Search'
      name='Screen-Shared-Search'
      component={ScreenSharedSearch}
      options={({ navigation }: any) => ({
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
      })}
    />,
    <Stack.Screen
      key='Screen-Shared-Announcements'
      name='Screen-Shared-Announcements'
      component={ScreenSharedAnnouncements}
      options={{
        stackPresentation: 'transparentModal',
        stackAnimation: 'fade'
      }}
    />,
    <Stack.Screen
      key='Screen-Shared-ImagesViewer'
      name='Screen-Shared-ImagesViewer'
      component={ScreenSharedImagesViewer}
      options={{
        stackPresentation: 'transparentModal',
        stackAnimation: 'none'
      }}
    />,
    <Stack.Screen
      key='Screen-Shared-Relationships'
      name='Screen-Shared-Relationships'
      component={ScreenSharedRelationships}
      options={({ route, navigation }: any) => ({
        title: route.params.account.display_name || route.params.account.name,
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
      })}
    />
  ]
}

export default sharedScreens
