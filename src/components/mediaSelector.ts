import analytics from '@components/analytics'
import { ActionSheetOptions } from '@expo/react-native-action-sheet'
import { store } from '@root/store'
import { getInstanceConfigurationStatusMaxAttachments } from '@utils/slices/instancesSlice'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import * as ExpoImagePicker from 'expo-image-picker'
import i18next from 'i18next'
import { Alert, Linking, Platform } from 'react-native'
import ImagePicker, {
  Image,
  ImageOrVideo
} from 'react-native-image-crop-picker'

export interface Props {
  mediaType?: 'photo' | 'video'
  resize?: { width?: number; height?: number }
  maximum?: number
  indicateMaximum?: boolean
  showActionSheetWithOptions: (
    options: ActionSheetOptions,
    callback: (i?: number | undefined) => void | Promise<void>
  ) => void
}

const mediaSelector = async ({
  mediaType,
  resize,
  maximum,
  indicateMaximum = false,
  showActionSheetWithOptions
}: Props): Promise<({ uri: string } & Omit<ImageOrVideo, 'path'>)[]> => {
  const checkLibraryPermission = async (): Promise<boolean> => {
    const { status } =
      await ExpoImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        i18next.t('componentMediaSelector:library.alert.title'),
        i18next.t('componentMediaSelector:library.alert.message'),
        [
          {
            text: i18next.t('common:buttons.cancel'),
            style: 'cancel',
            onPress: () =>
              analytics('mediaSelector_nopermission', {
                action: 'cancel'
              })
          },
          {
            text: i18next.t(
              'componentMediaSelector:library.alert.buttons.settings'
            ),
            style: 'default',
            onPress: () => {
              analytics('mediaSelector_nopermission', {
                action: 'settings'
              })
              Linking.openURL('app-settings:')
            }
          }
        ]
      )
      return false
    } else {
      return true
    }
  }

  const _maximum =
    maximum ||
    getInstanceConfigurationStatusMaxAttachments(store.getState()) ||
    4

  const options = () => {
    switch (mediaType) {
      case 'photo':
        return [
          i18next.t(
            'componentMediaSelector:options.image',
            indicateMaximum ? { context: 'max', max: _maximum } : undefined
          ),
          i18next.t('common:buttons.cancel')
        ]
      case 'video':
        return [
          i18next.t(
            'componentMediaSelector:options.video',
            indicateMaximum ? { context: 'max', max: 1 } : undefined
          ),
          i18next.t('common:buttons.cancel')
        ]
      default:
        return [
          i18next.t(
            'componentMediaSelector:options.image',
            indicateMaximum ? { context: 'max', max: _maximum } : undefined
          ),
          i18next.t(
            'componentMediaSelector:options.video',
            indicateMaximum ? { context: 'max', max: 1 } : undefined
          ),
          i18next.t('common:buttons.cancel')
        ]
    }
  }

  return new Promise((resolve, reject) => {
    const selectImage = async () => {
      const images = await ImagePicker.openPicker({
        mediaType: 'photo',
        includeExif: false,
        multiple: true,
        minFiles: 1,
        maxFiles: _maximum,
        smartAlbums: ['UserLibrary'],
        writeTempFile: false,
        loadingLabelText: ''
      }).catch(() => {})

      if (!images) {
        return reject()
      }

      // react-native-image-crop-picker may return HEIC as JPG that causes upload failure
      if (Platform.OS === 'ios') {
        for (const [index, image] of images.entries()) {
          if (image.mime === 'image/heic') {
            const converted = await manipulateAsync(image.sourceURL!, [], {
              base64: false,
              compress: 0.8,
              format: SaveFormat.JPEG
            })
            images[index] = {
              ...images[index],
              sourceURL: converted.uri,
              mime: 'image/jpeg'
            }
          }
        }
      }

      if (!resize) {
        return resolve(
          images.map(image => ({
            ...image,
            uri: image.sourceURL || `file://${image.path}`
          }))
        )
      } else {
        const croppedImages: Image[] = []
        for (const image of images) {
          const croppedImage = await ImagePicker.openCropper({
            mediaType: 'photo',
            path: image.path,
            width: resize.width,
            height: resize.height,
            cropperChooseText: i18next.t('common:buttons.apply'),
            cropperCancelText: i18next.t('common:buttons.cancel'),
            hideBottomControls: true
          }).catch(() => {})
          croppedImage && croppedImages.push(croppedImage)
        }
        return resolve(
          croppedImages.map(image => ({
            ...image,
            uri: `file://${image.path}`
          }))
        )
      }
    }
    const selectVideo = async () => {
      const video = await ImagePicker.openPicker({
        mediaType: 'video',
        includeExif: false,
        loadingLabelText: ''
      }).catch(() => {})

      if (video) {
        return resolve([
          { ...video, uri: video.sourceURL || `file://${video.path}` }
        ])
      } else {
        return reject()
      }
    }
    showActionSheetWithOptions(
      {
        title: i18next.t('componentMediaSelector:title'),
        options: options(),
        cancelButtonIndex: mediaType ? 1 : 2
      },
      async buttonIndex => {
        if (!(await checkLibraryPermission())) {
          return reject()
        }

        switch (mediaType) {
          case 'photo':
            if (buttonIndex === 0) {
              await selectImage()
            }
            break
          case 'video':
            if (buttonIndex === 0) {
              await selectVideo()
            }
            break
          default:
            if (buttonIndex === 0) {
              await selectImage()
            } else if (buttonIndex === 1) {
              await selectVideo()
            }
            break
        }
      }
    )
  })
}

export default mediaSelector
