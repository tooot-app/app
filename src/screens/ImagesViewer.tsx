import analytics from '@components/analytics'
import haptics from '@components/haptics'
import { HeaderCenter, HeaderLeft, HeaderRight } from '@components/Header'
import { useActionSheet } from '@expo/react-native-action-sheet'
import CameraRoll from '@react-native-community/cameraroll'
import { StackScreenProps } from '@react-navigation/stack'
import ImageView from '@root/modules/react-native-image-viewing/src/index'
import { findIndex } from 'lodash'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  PermissionsAndroid,
  Platform,
  Share,
  StatusBar,
  View
} from 'react-native'
import {
  SafeAreaProvider,
  useSafeAreaInsets
} from 'react-native-safe-area-context'

const HeaderComponent = React.memo(
  ({
    navigation,
    currentIndex,
    imageUrls
  }: {
    navigation: ScreenImagesViewerProp['navigation']
    currentIndex: number
    imageUrls: {
      url: string
      width?: number | undefined
      height?: number | undefined
      preview_url: string
      remote_url?: string | undefined
    }[]
  }) => {
    const insets = useSafeAreaInsets()
    const { t } = useTranslation('screenImageViewer')
    const { showActionSheetWithOptions } = useActionSheet()

    const hasAndroidPermission = async () => {
      const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE

      const hasPermission = await PermissionsAndroid.check(permission)
      if (hasPermission) {
        return true
      }

      const status = await PermissionsAndroid.request(permission)
      return status === 'granted'
    }

    const saveImage = async () => {
      if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
        return
      }
      CameraRoll.save(
        imageUrls[currentIndex].url ||
          imageUrls[currentIndex].remote_url ||
          imageUrls[currentIndex].preview_url
      )
        .then(() => haptics('Success'))
        .catch(() => haptics('Error'))
    }

    const onPress = useCallback(() => {
      analytics('imageviewer_more_press')
      showActionSheetWithOptions(
        {
          options: [
            t('content.options.save'),
            t('content.options.share'),
            t('content.options.cancel')
          ],
          cancelButtonIndex: 2
        },
        async buttonIndex => {
          switch (buttonIndex) {
            case 0:
              analytics('imageviewer_more_save_press')
              saveImage()
              break
            case 1:
              analytics('imageviewer_more_share_press')
              switch (Platform.OS) {
                case 'ios':
                  return Share.share({ url: imageUrls[currentIndex].url })
                case 'android':
                  return Share.share({ message: imageUrls[currentIndex].url })
              }
              break
          }
        }
      )
    }, [currentIndex])

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: insets.top
        }}
      >
        <HeaderLeft
          content='X'
          native={false}
          onPress={() => navigation.goBack()}
        />
        <HeaderCenter
          inverted
          content={`${currentIndex + 1} / ${imageUrls.length}`}
        />
        <HeaderRight
          content='MoreHorizontal'
          native={false}
          onPress={onPress}
        />
      </View>
    )
  },
  (prev, next) => prev.currentIndex === next.currentIndex
)

export type ScreenImagesViewerProp = StackScreenProps<
  Nav.RootStackParamList,
  'Screen-ImagesViewer'
>

const ScreenImagesViewer = ({
  route: {
    params: { imageUrls, id }
  },
  navigation
}: ScreenImagesViewerProp) => {
  if (imageUrls.length === 0) {
    return null
  }

  const initialIndex = findIndex(imageUrls, ['id', id])
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor='rgb(0,0,0)' />
      <ImageView
        images={imageUrls}
        imageIndex={initialIndex}
        onImageIndexChange={index => setCurrentIndex(index)}
        onRequestClose={() => navigation.goBack()}
        HeaderComponent={() => (
          <HeaderComponent
            navigation={navigation}
            currentIndex={currentIndex}
            imageUrls={imageUrls}
          />
        )}
      />
    </SafeAreaProvider>
  )
}

export default ScreenImagesViewer
