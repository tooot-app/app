import haptics from '@components/haptics'
import CameraRoll from '@react-native-community/cameraroll'
import { FileSystem, Permissions } from 'react-native-unimodules'

const saveIos = async (
  image: Nav.RootStackParamList['Screen-ImagesViewer']['imageUrls'][0]
) => {
  CameraRoll.save(image.url)
    .then(() => {
      haptics('Success')
    })
    .catch(() => {
      if (image.remote_url) {
        CameraRoll.save(image.remote_url)
          .then(() => haptics('Success'))
          .catch(() => haptics('Error'))
      } else {
        haptics('Error')
      }
    })
}

const saveAndroid = async (
  image: Nav.RootStackParamList['Screen-ImagesViewer']['imageUrls'][0]
) => {
  const fileUri: string = `${FileSystem.documentDirectory}test.jpg`
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
    .then(() => haptics('Success'))
    .catch(() => haptics('Error'))
}

export { saveIos, saveAndroid }
