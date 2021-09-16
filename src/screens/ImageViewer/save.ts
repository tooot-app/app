import haptics from '@components/haptics'
import { displayMessage } from '@components/Message'
import CameraRoll from '@react-native-community/cameraroll'
import { RootStackParamList } from '@utils/navigation/navigators'
import i18next from 'i18next'
import { RefObject } from 'react'
import { Platform } from 'react-native'
import FlashMessage from 'react-native-flash-message'
import { FileSystem, Permissions } from 'react-native-unimodules'

type CommonProps = {
  messageRef: RefObject<FlashMessage>
  mode: 'light' | 'dark'
  image: RootStackParamList['Screen-ImagesViewer']['imageUrls'][0]
}

const saveIos = async ({ messageRef, mode, image }: CommonProps) => {
  CameraRoll.save(image.url)
    .then(() => {
      haptics('Success')
      displayMessage({
        ref: messageRef,
        mode,
        type: 'success',
        message: i18next.t('screenImageViewer:content.save.succeed')
      })
    })
    .catch(() => {
      if (image.remote_url) {
        CameraRoll.save(image.remote_url)
          .then(() => {
            haptics('Success')
            displayMessage({
              ref: messageRef,
              mode,
              type: 'success',
              message: i18next.t('screenImageViewer:content.save.succeed')
            })
          })
          .catch(() => {
            haptics('Error')
            displayMessage({
              ref: messageRef,
              mode,
              type: 'error',
              message: i18next.t('screenImageViewer:content.save.failed')
            })
          })
      } else {
        haptics('Error')
        displayMessage({
          ref: messageRef,
          mode,
          type: 'error',
          message: i18next.t('screenImageViewer:content.save.failed')
        })
      }
    })
}

const saveAndroid = async ({ messageRef, mode, image }: CommonProps) => {
  const fileUri: string = `${FileSystem.documentDirectory}${image.id}.jpg`
  const downloadedFile: FileSystem.FileSystemDownloadResult = await FileSystem.downloadAsync(
    image.url,
    fileUri
  )

  if (downloadedFile.status != 200) {
    console.warn('error!')
  }

  const perm = await Permissions.askAsync(Permissions.MEDIA_LIBRARY)
  if (perm.status != 'granted') {
    return
  }

  CameraRoll.save(downloadedFile.uri)
    .then(() => {
      haptics('Success')
      displayMessage({
        ref: messageRef,
        mode,
        type: 'success',
        message: i18next.t('screenImageViewer:content.save.succeed')
      })
    })
    .catch(() => {
      haptics('Error')
      displayMessage({
        ref: messageRef,
        mode,
        type: 'error',
        message: i18next.t('screenImageViewer:content.save.failed')
      })
    })
}

const saveImage = async (props: CommonProps) => {
  switch (Platform.OS) {
    case 'ios':
      saveIos(props)
      break
    case 'android':
      saveAndroid(props)
      break
  }
}

export default saveImage
