import analytics from '@components/analytics'
import { HeaderCenter, HeaderLeft, HeaderRight } from '@components/Header'
import { toast } from '@components/toast'
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
  StyleSheet,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

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
  if (imageUrls.length === 0) {
    return null
  }

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
      imageUrls[imageIndex].url ||
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

  const HeaderComponent = useCallback(
    () => (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
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
    ),
    [currentIndex]
  )

  return (
    <SafeAreaView style={styles.base} edges={['top']}>
      <StatusBar backgroundColor='rgb(0,0,0)' />
      <ImageView
        images={imageUrls.map(urls => ({ uri: urls.url }))}
        imageIndex={imageIndex}
        onImageIndexChange={index => setCurrentIndex(index)}
        onRequestClose={() => navigation.goBack()}
        HeaderComponent={HeaderComponent}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: 'black'
  }
})

export default ScreenImagesViewer
