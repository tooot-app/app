import { HeaderLeft } from '@components/Header'
import { displayMessage, Message } from '@components/Message'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ScreenAccountSelection from '@screens/AccountSelection'
import ScreenAnnouncements from '@screens/Announcements'
import ScreenCompose from '@screens/Compose'
import ScreenImagesViewer from '@screens/ImageViewer'
import ScreenTabs from '@screens/Tabs'
import navigationRef from '@utils/navigation/navigationRef'
import { RootStackParamList } from '@utils/navigation/navigators'
import pushUseConnect from '@utils/push/useConnect'
import pushUseReceive from '@utils/push/useReceive'
import pushUseRespond from '@utils/push/useRespond'
import { useEmojisQuery } from '@utils/queryHooks/emojis'
import { useFiltersQuery } from '@utils/queryHooks/filters'
import { useInstanceQuery } from '@utils/queryHooks/instance'
import { usePreferencesQuery } from '@utils/queryHooks/preferences'
import { useProfileQuery } from '@utils/queryHooks/profile'
import { useFollowedTagsQuery } from '@utils/queryHooks/tags'
import { setAccount, setGlobalStorage, useGlobalStorage } from '@utils/storage/actions'
import { useTheme } from '@utils/styles/ThemeManager'
import { themes } from '@utils/styles/themes'
import * as Linking from 'expo-linking'
import { addScreenshotListener } from 'expo-screen-capture'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IntlProvider } from 'react-intl'
import { Alert, Platform, StatusBar } from 'react-native'
import ShareMenu from 'react-native-share-menu'
import { routingInstrumentation } from '../utils/startup/sentry'

const Stack = createNativeStackNavigator<RootStackParamList>()

const Screens: React.FC = () => {
  const { t, i18n } = useTranslation([
    'common',
    'screens',
    'screenAnnouncements',
    'screenAccountSelection'
  ])

  const [accounts] = useGlobalStorage.object('accounts')
  const [accountActive] = useGlobalStorage.string('account.active')
  const { colors, theme } = useTheme()

  // Push hooks
  pushUseConnect()
  pushUseReceive()
  pushUseRespond()

  // Prevent screenshot alert
  useEffect(() => {
    const screenshotListener = addScreenshotListener(() =>
      Alert.alert(t('screens:screenshot.title'), t('screens:screenshot.message'), [
        { text: t('common:buttons.confirm'), style: 'destructive' }
      ])
    )
    Platform.select({ ios: screenshotListener })
    return () => screenshotListener.remove()
  }, [])

  // Lazily update users's preferences, for e.g. composing default visibility
  useInstanceQuery({ options: { enabled: !!accountActive } })
  useProfileQuery({ options: { enabled: !!accountActive } })
  usePreferencesQuery({ options: { enabled: !!accountActive } })
  useFiltersQuery({ options: { enabled: !!accountActive } })
  useEmojisQuery({ options: { enabled: !!accountActive } })
  useFollowedTagsQuery({ options: { enabled: !!accountActive } })

  // Callbacks
  const navigationContainerOnStateChange = () => {
    const currentRoute = navigationRef.getCurrentRoute()

    const matchTabName = currentRoute?.name?.match(/(Tab-.*)-Root/)
    if (matchTabName?.[1]) {
      // @ts-ignore
      setGlobalStorage('app.prev_tab', matchTabName[1])
    }
  }

  // Deep linking for compose
  const [deeplinked, setDeeplinked] = useState(false)
  useEffect(() => {
    const getUrlAsync = async () => {
      setDeeplinked(true)

      const initialUrl = await Linking.parseInitialURLAsync()

      if (initialUrl.path) {
        const paths = initialUrl.path.split('/')

        if (paths.length) {
          if (accountActive && !accounts?.includes(accountActive)) {
            setAccount(accountActive)
          }
        }
      }

      if (initialUrl.hostname === 'compose') {
        navigationRef.navigate('Screen-Compose')
      }
    }
    if (!deeplinked) {
      getUrlAsync()
    }
  }, [accounts, accountActive, deeplinked])

  // Share Extension
  const handleShare = (
    item?:
      | {
          data: { mimeType: string; data: string }[]
          mimeType: undefined
        }
      | { data: string | string[]; mimeType: string }
  ) => {
    if (!accountActive) {
      return
    }
    if (!item || !item.data) {
      return
    }

    let text: string | undefined = undefined
    let media: { uri: string; mime: string }[] = []

    const typesImage = ['png', 'jpg', 'jpeg', 'gif']
    const typesVideo = ['mp4', 'm4v', 'mov', 'webm', 'mpeg']
    const filterMedia = ({ uri, mime }: { uri: string; mime: string }) => {
      if (mime.startsWith('image/')) {
        if (!typesImage.includes(mime.split('/')[1])) {
          console.warn('Image type not supported:', mime.split('/')[1])
          displayMessage({
            message: t('screens:shareError.imageNotSupported', {
              type: mime.split('/')[1]
            }),
            type: 'danger'
          })
          return
        }
        media.push({ uri, mime })
      } else if (mime.startsWith('video/')) {
        if (!typesVideo.includes(mime.split('/')[1])) {
          console.warn('Video type not supported:', mime.split('/')[1])
          displayMessage({
            message: t('screens:shareError.videoNotSupported', {
              type: mime.split('/')[1]
            }),
            type: 'danger'
          })
          return
        }
        media.push({ uri, mime })
      } else {
        if (typesImage.includes(uri.split('.').pop() || '')) {
          media.push({ uri, mime: 'image/jpg' })
          return
        }
        if (typesVideo.includes(uri.split('.').pop() || '')) {
          media.push({ uri, mime: 'video/mp4' })
          return
        }
        text = !text ? uri : text.concat(text, `\n${uri}`)
      }
    }

    switch (Platform.OS) {
      case 'ios':
        if (!Array.isArray(item.data) || !item.data) {
          return
        }

        for (const d of item.data) {
          if (typeof d !== 'string') {
            filterMedia({ uri: d.data, mime: d.mimeType })
          }
        }
        break
      case 'android':
        if (!item.mimeType) {
          return
        }
        if (Array.isArray(item.data)) {
          for (const d of item.data) {
            filterMedia({ uri: d, mime: item.mimeType })
          }
        } else {
          filterMedia({ uri: item.data, mime: item.mimeType })
        }
        break
    }

    if (!text && !media.length) {
      return
    } else {
      if (accounts?.length) {
        navigationRef.navigate('Screen-AccountSelection', {
          share: { text, media }
        })
      } else {
        navigationRef.navigate('Screen-Compose', {
          type: 'share',
          text,
          media
        })
      }
    }
  }
  useEffect(() => {
    ShareMenu.getInitialShare(handleShare)
  }, [])
  useEffect(() => {
    const listener = ShareMenu.addNewShareListener(handleShare)
    return () => {
      listener.remove()
    }
  }, [])

  return (
    <IntlProvider locale={i18n.language}>
      <StatusBar
        backgroundColor={colors.backgroundDefault}
        {...(Platform.OS === 'android' && {
          barStyle: theme === 'light' ? 'dark-content' : 'light-content'
        })}
      />
      <NavigationContainer
        ref={navigationRef}
        theme={themes[theme]}
        onReady={() => routingInstrumentation.registerNavigationContainer(navigationRef)}
        onStateChange={navigationContainerOnStateChange}
      >
        <Stack.Navigator initialRouteName='Screen-Tabs'>
          <Stack.Screen
            name='Screen-Tabs'
            component={ScreenTabs}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name='Screen-Announcements'
            component={ScreenAnnouncements}
            options={({ navigation }) => ({
              presentation: 'transparentModal',
              animation: 'fade',
              headerShown: true,
              headerShadowVisible: false,
              headerTransparent: true,
              headerStyle: { backgroundColor: 'transparent' },
              headerLeft: () => <HeaderLeft content='x' onPress={() => navigation.goBack()} />,
              title: t('screenAnnouncements:heading')
            })}
          />
          <Stack.Screen
            name='Screen-Compose'
            component={ScreenCompose}
            options={{
              headerShown: false,
              presentation: 'fullScreenModal'
            }}
          />
          <Stack.Screen
            name='Screen-ImagesViewer'
            component={ScreenImagesViewer}
            options={{ headerShown: false, animation: 'fade' }}
          />
          <Stack.Screen
            name='Screen-AccountSelection'
            component={ScreenAccountSelection}
            options={({ navigation }) => ({
              title: t('screenAccountSelection:heading'),
              headerShadowVisible: false,
              presentation: 'modal',
              gestureEnabled: false,
              headerLeft: () => (
                <HeaderLeft
                  type='text'
                  content={t('common:buttons.cancel')}
                  onPress={() => navigation.goBack()}
                />
              )
            })}
          />
        </Stack.Navigator>

        <Message />
      </NavigationContainer>
    </IntlProvider>
  )
}

export default Screens
