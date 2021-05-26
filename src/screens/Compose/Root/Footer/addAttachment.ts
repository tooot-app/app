import * as Crypto from 'expo-crypto'
import { ImageInfo } from 'expo-image-picker/build/ImagePicker.types'
import * as VideoThumbnails from 'expo-video-thumbnails'
import { Dispatch } from 'react'
import { Alert } from 'react-native'
import { ComposeAction } from '../../utils/types'
import { ActionSheetOptions } from '@expo/react-native-action-sheet'
import i18next from 'i18next'
import apiInstance from '@api/instance'
import mediaSelector from '@components/mediaSelector'

export interface Props {
  composeDispatch: Dispatch<ComposeAction>
  showActionSheetWithOptions: (
    options: ActionSheetOptions,
    callback: (i: number) => void
  ) => void
}

const addAttachment = async ({
  composeDispatch,
  showActionSheetWithOptions
}: Props): Promise<any> => {
  const uploader = async (imageInfo: ImageInfo) => {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      imageInfo.uri + Math.random()
    )

    let attachmentType: string

    switch (imageInfo.type) {
      case 'image':
        attachmentType = `image/${imageInfo.uri.split('.')[1]}`
        composeDispatch({
          type: 'attachment/upload/start',
          payload: {
            local: { ...imageInfo, local_thumbnail: imageInfo.uri, hash },
            uploading: true
          }
        })
        break
      case 'video':
        attachmentType = `video/${imageInfo.uri.split('.')[1]}`
        VideoThumbnails.getThumbnailAsync(imageInfo.uri)
          .then(({ uri }) =>
            composeDispatch({
              type: 'attachment/upload/start',
              payload: {
                local: { ...imageInfo, local_thumbnail: uri, hash },
                uploading: true
              }
            })
          )
          .catch(() =>
            composeDispatch({
              type: 'attachment/upload/start',
              payload: {
                local: { ...imageInfo, hash },
                uploading: true
              }
            })
          )
        break
      default:
        attachmentType = 'unknown'
        composeDispatch({
          type: 'attachment/upload/start',
          payload: {
            local: { ...imageInfo, hash },
            uploading: true
          }
        })
        break
    }

    const uploadFailed = () => {
      composeDispatch({
        type: 'attachment/upload/fail',
        payload: hash
      })
      Alert.alert(
        i18next.t(
          'screenCompose:content.root.actions.attachment.failed.alert.title'
        ),
        undefined,
        [
          {
            text: i18next.t(
              'screenCompose:content.root.actions.attachment.failed.alert.button'
            ),
            onPress: () => {}
          }
        ]
      )
    }

    const formData = new FormData()
    formData.append('file', {
      // @ts-ignore
      uri: imageInfo.uri,
      name: attachmentType,
      type: attachmentType
    })

    return apiInstance<Mastodon.Attachment>({
      method: 'post',
      url: 'media',
      body: formData
    })
      .then(res => {
        if (res.body.id) {
          composeDispatch({
            type: 'attachment/upload/end',
            payload: { remote: res.body, local: imageInfo }
          })
        } else {
          uploadFailed()
        }
      })
      .catch(() => {
        uploadFailed()
      })
  }

  const result = await mediaSelector({ showActionSheetWithOptions })
  await uploader(result)
}

export default addAttachment
