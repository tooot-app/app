import * as Crypto from 'expo-crypto'
import * as VideoThumbnails from 'expo-video-thumbnails'
import { Dispatch } from 'react'
import { Alert } from 'react-native'
import { ComposeAction } from '../../utils/types'
import { ActionSheetOptions } from '@expo/react-native-action-sheet'
import i18next from 'i18next'
import apiInstance from '@api/instance'
import mediaSelector from '@components/mediaSelector'
import { Asset } from 'react-native-image-picker'

export interface Props {
  composeDispatch: Dispatch<ComposeAction>
  showActionSheetWithOptions: (
    options: ActionSheetOptions,
    callback: (i?: number | undefined) => void | Promise<void>
  ) => void
}

export const uploadAttachment = async ({
  composeDispatch,
  media
}: {
  composeDispatch: Dispatch<ComposeAction>
  media: Required<Pick<Asset, 'uri' | 'type' | 'fileName'>>
}) => {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    media.uri + Math.random()
  )

  switch (media.type.split('/')[0]) {
    case 'image':
      composeDispatch({
        type: 'attachment/upload/start',
        payload: {
          local: { ...media, thumbnail: media.uri, hash },
          uploading: true
        }
      })
      break
    case 'video':
      VideoThumbnails.getThumbnailAsync(media.uri)
        .then(({ uri, width, height }) => {
          composeDispatch({
            type: 'attachment/upload/start',
            payload: {
              local: { ...media, thumbnail: uri, hash, width, height },
              uploading: true
            }
          })
        })
        .catch(() =>
          composeDispatch({
            type: 'attachment/upload/start',
            payload: {
              local: { ...media, hash },
              uploading: true
            }
          })
        )
      break
    default:
      composeDispatch({
        type: 'attachment/upload/start',
        payload: {
          local: { ...media, hash },
          uploading: true
        }
      })
      break
  }

  const uploadFailed = (message?: string) => {
    composeDispatch({
      type: 'attachment/upload/fail',
      payload: hash
    })
    Alert.alert(
      i18next.t(
        'screenCompose:content.root.actions.attachment.failed.alert.title'
      ),
      message,
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
    uri: media.uri,
    name: media.fileName,
    type: media.type
  } as any)

  return apiInstance<Mastodon.Attachment>({
    method: 'post',
    version: 'v2',
    url: 'media',
    body: formData
  })
    .then(res => {
      if (res.body.id) {
        composeDispatch({
          type: 'attachment/upload/end',
          payload: { remote: res.body, local: media }
        })
      } else {
        uploadFailed()
      }
    })
    .catch((err: any) => {
      uploadFailed(
        err?.message && typeof err?.message === 'string'
          ? err?.message.slice(0, 50)
          : undefined
      )
    })
}

const chooseAndUploadAttachment = async ({
  composeDispatch,
  showActionSheetWithOptions
}: Props): Promise<any> => {
  const result = await mediaSelector({
    indicateMaximum: true,
    showActionSheetWithOptions
  })
  for (const media of result) {
    const requiredMedia = media as Required<Asset>
    uploadAttachment({ composeDispatch, media: requiredMedia })
    await new Promise(res => setTimeout(res, 500))
  }
}

export default chooseAndUploadAttachment
