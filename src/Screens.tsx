import analytics from '@components/analytics'
import { HeaderLeft } from '@components/Header'
import { displayMessage, Message } from '@components/Message'
import navigationRef from '@helpers/navigationRef'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ScreenActions from '@screens/Actions'
import ScreenAnnouncements from '@screens/Announcements'
import ScreenCompose from '@screens/Compose'
import ScreenImagesViewer from '@screens/ImagesViewer'
import ScreenTabs from '@screens/Tabs'
import initQuery from '@utils/initQuery'
import { RootStackParamList } from '@utils/navigation/navigators'
import pushUseConnect from '@utils/push/useConnect'
import pushUseReceive from '@utils/push/useReceive'
import pushUseRespond from '@utils/push/useRespond'
import { updatePreviousTab } from '@utils/slices/contextsSlice'
import { checkEmojis } from '@utils/slices/instances/checkEmojis'
import { updateAccountPreferences } from '@utils/slices/instances/updateAccountPreferences'
import { updateConfiguration } from '@utils/slices/instances/updateConfiguration'
import { updateFilters } from '@utils/slices/instances/updateFilters'
import { getInstanceActive, getInstances } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import { themes } from '@utils/styles/themes'
import * as Linking from 'expo-linking'
import { addScreenshotListener } from 'expo-screen-capture'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IntlProvider } from 'react-intl'
import { Alert, Platform, StatusBar } from 'react-native'
import ShareMenu from 'react-native-share-menu'
import { useSelector } from 'react-redux'
import * as Sentry from 'sentry-expo'
import { useAppDispatch } from './store'

const Stack = createNativeStackNavigator<RootStackParamList>()

export interface Props {
  localCorrupt?: string
}

const Screens: React.FC<Props> = ({ localCorrupt }) => {
  const { i18n, t } = useTranslation('screens')
  const dispatch = useAppDispatch()
  const instanceActive = useSelector(getInstanceActive)
  const { colors, theme } = useTheme()

  const routeRef = useRef<{ name?: string; params?: {} }>()

  // Push hooks
  const instances = useSelector(
    getInstances,
    (prev, next) => prev.length === next.length
  )
  pushUseConnect({ t, instances })
  pushUseReceive({ instances })
  pushUseRespond({ instances })

  // Prevent screenshot alert
  useEffect(() => {
    const screenshotListener = addScreenshotListener(() =>
      Alert.alert(t('screenshot.title'), t('screenshot.message'), [
        { text: t('screenshot.button'), style: 'destructive' }
      ])
    )
    Platform.select({ ios: screenshotListener })
    return () => screenshotListener.remove()
  }, [])

  // On launch display login credentials corrupt information
  useEffect(() => {
    const showLocalCorrect = () => {
      if (localCorrupt) {
        displayMessage({
          message: t('localCorrupt.message'),
          description: localCorrupt.length ? localCorrupt : undefined,
          type: 'error',
          theme
        })
        // @ts-ignore
        navigationRef.navigate('Screen-Tabs', {
          screen: 'Tab-Me'
        })
      }
    }
    return showLocalCorrect()
  }, [localCorrupt])

  // Lazily update users's preferences, for e.g. composing default visibility
  useEffect(() => {
    if (instanceActive !== -1) {
      dispatch(updateConfiguration())
      dispatch(updateFilters())
      dispatch(updateAccountPreferences())
      dispatch(checkEmojis())
    }
  }, [instanceActive])

  // Callbacks
  const navigationContainerOnReady = useCallback(() => {
    const currentRoute = navigationRef.getCurrentRoute()
    routeRef.current = {
      name: currentRoute?.name,
      params: currentRoute?.params
        ? JSON.stringify(currentRoute.params)
        : undefined
    }
  }, [])
  const navigationContainerOnStateChange = useCallback(() => {
    const previousRoute = routeRef.current
    const currentRoute = navigationRef.getCurrentRoute()

    const matchTabName = currentRoute?.name?.match(/(Tab-.*)-Root/)
    if (matchTabName) {
      //@ts-ignore
      dispatch(updatePreviousTab(matchTabName[1]))
    }

    if (previousRoute?.name !== currentRoute?.name) {
      analytics('screen_view', { screen_name: currentRoute?.name })
      Sentry.Native.setContext('page', {
        previous: previousRoute,
        current: currentRoute
      })
    }

    routeRef.current = currentRoute
  }, [])

  // Deep linking for compose
  const [deeplinked, setDeeplinked] = useState(false)
  useEffect(() => {
    const getUrlAsync = async () => {
      setDeeplinked(true)

      const initialUrl = await Linking.parseInitialURLAsync()

      if (initialUrl.path) {
        const paths = initialUrl.path.split('/')

        if (paths && paths.length) {
          const instanceIndex = instances.findIndex(
            instance => paths[0] === `@${instance.account.acct}@${instance.uri}`
          )
          if (instanceIndex !== -1 && instanceActive !== instanceIndex) {
            initQuery({
              instance: instances[instanceIndex],
              prefetch: { enabled: true }
            })
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
  }, [instanceActive, instances, deeplinked])

  // Share Extension
  const handleShare = useCallback(
    (
      item?:
        | {
            data: { mimeType: string; data: string }[]
            mimeType: undefined
          }
        | { data: string | string[]; mimeType: string }
    ) => {
      console.log('item', item)
      if (instanceActive < 0) {
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
              message: t('shareError.imageNotSupported', {
                type: mime.split('/')[1]
              }),
              type: 'error',
              theme
            })
            return
          }
          media.push({ uri, mime })
        } else if (mime.startsWith('video/')) {
          if (!typesVideo.includes(mime.split('/')[1])) {
            console.warn('Video type not supported:', mime.split('/')[1])
            displayMessage({
              message: t('shareError.videoNotSupported', {
                type: mime.split('/')[1]
              }),
              type: 'error',
              theme
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
          let tempData: string[]
          if (!Array.isArray(item.data)) {
            tempData = [item.data]
          } else {
            tempData = item.data
          }
          for (const d of item.data) {
            filterMedia({ uri: d, mime: item.mimeType })
          }
          break
      }

      if (!text && !media.length) {
        return
      } else {
        console.log('media', media)
        navigationRef.navigate('Screen-Compose', { type: 'share', text, media })
      }
    },
    [instanceActive]
  )
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
        onReady={navigationContainerOnReady}
        onStateChange={navigationContainerOnStateChange}
      >
        <Stack.Navigator initialRouteName='Screen-Tabs'>
          <Stack.Screen
            name='Screen-Tabs'
            component={ScreenTabs}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name='Screen-Actions'
            component={ScreenActions}
            options={{
              presentation: 'transparentModal',
              animation: 'fade',
              headerShown: false
            }}
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
              headerLeft: () => (
                <HeaderLeft content='X' onPress={() => navigation.goBack()} />
              ),
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
            options={{
              headerShown: false,
              presentation: 'fullScreenModal',
              animation: 'fade'
            }}
          />
        </Stack.Navigator>

        <Message />
      </NavigationContainer>
    </IntlProvider>
  )
}

export default React.memo(Screens, () => true)
