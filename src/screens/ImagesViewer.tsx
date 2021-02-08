import analytics from '@components/analytics'
import { HeaderRight } from '@components/Header'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { StackScreenProps } from '@react-navigation/stack'
import CameraRoll from '@react-native-community/cameraroll'
import { useTheme } from '@utils/styles/ThemeManager'
import { findIndex } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PermissionsAndroid, Platform, Share } from 'react-native'
import FastImage from 'react-native-fast-image'
import ImageViewer from 'react-native-image-zoom-viewer'
import { SharedElement } from 'react-navigation-shared-element'
import { toast } from '@components/toast'

export type ScreenImagesViewerProp = StackScreenProps<
  Nav.RootStackParamList,
  'Screen-ImagesViewer'
>

const ScreenImagesViewer = ({
  route: {
    params: { imageUrls, imageIndex }
  },
  navigation
}: ScreenImagesViewerProp) => {
  const { theme } = useTheme()
  const [currentIndex, setCurrentIndex] = useState(
    findIndex(imageUrls, ['imageIndex', imageIndex])
  )

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
      imageUrls[imageIndex].originUrl ||
        imageUrls[imageIndex].remote_url ||
        imageUrls[imageIndex].preview_url
    )
      .then(() =>
        toast({ type: 'success', message: t('content.save.success') })
      )
      .catch(() =>
        toast({
          type: 'error',
          message: t('common:toastMessage.error.message', {
            function: t('content.save.function')
          })
        })
      )
  }

  const { t } = useTranslation('screenImageViewer')
  const { showActionSheetWithOptions } = useActionSheet()
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

  useEffect(
    () =>
      navigation.setOptions({
        headerTitle: `${currentIndex + 1} / ${imageUrls.length}`,
        headerTintColor: theme.primaryOverlay,
        headerRight: () => (
          <HeaderRight
            content='MoreHorizontal'
            native={false}
            onPress={onPress}
          />
        )
      }),
    [currentIndex]
  )

  const renderImage = useCallback(
    prop => (
      <SharedElement id={`imageFail.${imageUrls[imageIndex].url}`}>
        <FastImage {...prop} />
      </SharedElement>
    ),
    []
  )

  return (
    <ImageViewer
      index={imageIndex}
      imageUrls={imageUrls}
      enableSwipeDown
      useNativeDriver
      swipeDownThreshold={100}
      renderIndicator={() => <></>}
      saveToLocalByLongPress={false}
      onSwipeDown={() => navigation.goBack()}
      onChange={index => index && setCurrentIndex(index)}
      renderImage={renderImage}
    />
  )
}

export default ScreenImagesViewer
