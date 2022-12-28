import { ActionSheetOptions } from '@expo/react-native-action-sheet'
import queryClient from '@utils/helpers/queryClient'
import { QueryKeyInstance } from '@utils/queryHooks/instance'
import i18next from 'i18next'
import { Asset, launchImageLibrary } from 'react-native-image-picker'

const queryKeyInstance: QueryKeyInstance = ['Instance']
export const MAX_MEDIA_ATTACHMENTS: number =
  queryClient.getQueryData<Mastodon.Instance<any>>(queryKeyInstance)?.configuration?.statuses
    .max_media_attachments || 4

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
}: Props): Promise<Asset[]> => {
  const _maximum = maximum || MAX_MEDIA_ATTACHMENTS

  const options = () => {
    switch (mediaType) {
      case 'photo':
        return [
          i18next.t(
            'componentMediaSelector:options.image',
            indicateMaximum ? { context: 'max', max: _maximum } : {}
          ),
          i18next.t('common:buttons.cancel')
        ]
      case 'video':
        return [
          i18next.t(
            'componentMediaSelector:options.video',
            indicateMaximum ? { context: 'max', max: 1 } : {}
          ),
          i18next.t('common:buttons.cancel')
        ]
      default:
        return [
          i18next.t(
            'componentMediaSelector:options.image',
            indicateMaximum ? { context: 'max', max: _maximum } : {}
          ),
          i18next.t(
            'componentMediaSelector:options.video',
            indicateMaximum ? { context: 'max', max: 1 } : {}
          ),
          i18next.t('common:buttons.cancel')
        ]
    }
  }

  return new Promise((resolve, reject) => {
    const selectImage = async () => {
      const images = await launchImageLibrary({
        mediaType: 'photo',
        ...(resize && { maxWidth: resize.width, maxHeight: resize.height }),
        includeBase64: false,
        includeExtra: false,
        selectionLimit: _maximum
      })

      if (!images.assets) {
        return reject()
      }

      return resolve(images.assets)
    }
    const selectVideo = async () => {
      const video = await launchImageLibrary({
        mediaType: 'video',
        includeBase64: false,
        includeExtra: false,
        selectionLimit: 1
      })

      if (video.assets?.[0]) {
        return resolve(video.assets)
      } else {
        return reject()
      }
    }
    showActionSheetWithOptions(
      {
        title: i18next.t('componentMediaSelector:title'),
        message: i18next.t('componentMediaSelector:message'),
        options: options(),
        cancelButtonIndex: mediaType ? 1 : 2
      },
      async buttonIndex => {
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
