import haptics from '@components/haptics'
import { displayMessage } from '@components/Message'
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import { RootStackParamList } from '@utils/navigation/navigators'
import * as FileSystem from 'expo-file-system'
import i18next from 'i18next'
import { PermissionsAndroid, Platform } from 'react-native'

type CommonProps = {
  image: RootStackParamList['Screen-ImagesViewer']['imageUrls'][0]
}

const saveIos = async ({ image }: CommonProps) => {
  CameraRoll.save(image.url)
    .then(() => {
      haptics('Success')
      displayMessage({
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
              type: 'success',
              message: i18next.t('screenImageViewer:content.save.succeed')
            })
          })
          .catch(() => {
            haptics('Error')
            displayMessage({
              type: 'danger',
              message: i18next.t('screenImageViewer:content.save.failed')
            })
          })
      } else {
        haptics('Error')
        displayMessage({
          type: 'danger',
          message: i18next.t('screenImageViewer:content.save.failed')
        })
      }
    })
}

const saveAndroid = async ({ image }: CommonProps) => {
  const fileUri: string = `${FileSystem.documentDirectory}${image.id}.jpg`
  const downloadedFile: FileSystem.FileSystemDownloadResult = await FileSystem.downloadAsync(
    image.url,
    fileUri
  )

  if (downloadedFile.status != 200) {
    haptics('Error')
    displayMessage({
      type: 'danger',
      message: i18next.t('screenImageViewer:content.save.failed')
    })
    return
  }

  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE

  const hasPermission = await PermissionsAndroid.check(permission)
  if (!hasPermission) {
    const status = await PermissionsAndroid.request(permission)
    if (status !== 'granted') {
      haptics('Error')
      displayMessage({
        type: 'danger',
        message: i18next.t('screenImageViewer:content.save.failed')
      })
      return
    }
  }

  CameraRoll.save(downloadedFile.uri)
    .then(() => {
      haptics('Success')
      displayMessage({
        type: 'success',
        message: i18next.t('screenImageViewer:content.save.succeed')
      })
    })
    .catch(() => {
      haptics('Error')
      displayMessage({
        type: 'danger',
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
