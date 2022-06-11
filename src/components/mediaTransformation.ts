import { store } from '@root/store'
import { getInstanceConfigurationMediaAttachments } from '@utils/slices/instancesSlice'
import { Action, manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import i18next from 'i18next'
import { Platform } from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'

export interface Props {
  type: 'image' | 'video'
  uri: string // This can be pure path or uri starting with file://
  mime?: string
  transform: {
    imageFormat?: SaveFormat.JPEG | SaveFormat.PNG
    resize?: boolean
    width?: number
    height?: number
  }
}

const getFileExtension = (uri: string) => {
  const extension = uri.split('.').pop()
  // Using mime type standard of jpeg
  return extension === 'jpg' ? 'jpeg' : extension
}

const mediaTransformation = async ({
  type,
  uri,
  mime,
  transform
}: Props): Promise<{
  uri: string
  mime: string
  width: number
  height: number
}> => {
  const configurationMediaAttachments =
    getInstanceConfigurationMediaAttachments(store.getState())

  const fileExtension = getFileExtension(uri)

  switch (type) {
    case 'image':
      if (mime === 'image/gif' || fileExtension === 'gif') {
        return Promise.reject('GIFs should not be transformed')
      }
      let targetFormat: SaveFormat.JPEG | SaveFormat.PNG = SaveFormat.JPEG

      const supportedImageTypes =
        configurationMediaAttachments.supported_mime_types.filter(mime =>
          mime.startsWith('image/')
        )

      // @ts-ignore
      const transformations: Action[] = [
        !transform.resize && (transform.width || transform.height)
          ? {
              resize: { width: transform.width, height: transform.height }
            }
          : null
      ].filter(t => !!t)

      if (mime) {
        if (
          mime !== `image/${fileExtension}` ||
          !supportedImageTypes.includes(mime)
        ) {
          targetFormat = transform.imageFormat || SaveFormat.JPEG
        } else {
          targetFormat = mime.split('/').pop() as any
        }
      } else {
        if (!fileExtension) {
          return Promise.reject('Unable to get file extension')
        }
        if (!supportedImageTypes.includes(`image/${fileExtension}`)) {
          targetFormat = transform.imageFormat || SaveFormat.JPEG
        } else {
          targetFormat = fileExtension as any
        }
      }

      const converted = await manipulateAsync(uri, transformations, {
        base64: false,
        compress: Platform.OS === 'ios' ? 0.8 : 1,
        format: targetFormat
      })

      if (transform.resize) {
        const resized = await ImagePicker.openCropper({
          mediaType: 'photo',
          path: converted.uri,
          width: transform.width,
          height: transform.height,
          cropperChooseText: i18next.t('common:buttons.apply'),
          cropperCancelText: i18next.t('common:buttons.cancel'),
          hideBottomControls: true
        })
        if (!resized) {
          return Promise.reject('Resize failed')
        } else {
          return {
            uri: resized.path,
            mime: resized.mime,
            width: resized.width,
            height: resized.height
          }
        }
      } else {
        return {
          uri: converted.uri,
          mime: transform.imageFormat || SaveFormat.JPEG,
          width: converted.width,
          height: converted.height
        }
      }
    case 'video':
      const supportedVideoTypes =
        configurationMediaAttachments.supported_mime_types.filter(mime =>
          mime.startsWith('video/')
        )

      if (mime) {
        if (mime !== `video/${fileExtension}`) {
          console.warn('Video mime type and file extension does not match')
        }
        if (!supportedVideoTypes.includes(mime)) {
          return Promise.reject('Video file type is not supported')
        }
      } else {
        if (!fileExtension) {
          return Promise.reject('Unable to get file extension')
        }
        if (!supportedVideoTypes.includes(`video/${fileExtension}`)) {
          return Promise.reject('Video file type is not supported')
        }
      }

      return {
        uri: uri,
        mime: mime || `video/${fileExtension}`,
        width: 0,
        height: 0
      }
      break
  }
}

export default mediaTransformation
