import { Dispatch } from 'react'
import { ActionSheetIOS, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

import { ComposeAction, ComposeState } from '@screens/Shared/Compose'
import client from '@api/client'
import { ImageInfo } from 'expo-image-picker/build/ImagePicker.types'

const uploadAttachment = async ({
  result,
  composeState,
  composeDispatch
}: {
  result: NonNullable<ImageInfo>
  composeState: ComposeState
  composeDispatch: Dispatch<ComposeAction>
}) => {
  const formData = new FormData()
  // @ts-ignore
  formData.append('file', {
    // @ts-ignore
    uri: result.uri,
    name: result.uri.split('/').pop(),
    type: 'image/jpeg/jpg'
  })

  client({
    method: 'post',
    instance: 'local',
    url: 'media',
    body: formData,
    onUploadProgress: p => {
      composeDispatch({
        type: 'attachmentUploadProgress',
        payload: {
          progress: p.loaded / p.total,
          aspect: result.width / result.height
        }
      })
    }
  })
    .then(({ body }: { body: Mastodon.Attachment & { local_url: string } }) => {
      composeDispatch({
        type: 'attachmentUploadProgress',
        payload: undefined
      })
      if (body.id) {
        body.local_url = result.uri
        composeDispatch({
          type: 'attachments',
          payload: { uploads: composeState.attachments.uploads.concat([body]) }
        })
        return Promise.resolve()
      } else {
        Alert.alert('上传失败', '', [
          {
            text: '返回重试',
            onPress: () =>
              composeDispatch({
                type: 'attachmentUploadProgress',
                payload: undefined
              })
          }
        ])
        return Promise.reject()
      }
    })
    .catch(() => {
      Alert.alert('上传失败', '', [
        {
          text: '返回重试',
          onPress: () =>
            composeDispatch({
              type: 'attachmentUploadProgress',
              payload: undefined
            })
        }
      ])
      return Promise.reject()
    })
}

const addAttachments = async ({
  ...params
}: {
  composeState: ComposeState
  composeDispatch: Dispatch<ComposeAction>
}): Promise<any> => {
  ActionSheetIOS.showActionSheetWithOptions(
    {
      options: ['从相册选取', '现照', '取消'],
      cancelButtonIndex: 2
    },
    async buttonIndex => {
      if (buttonIndex === 0) {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          exif: false
        })

        if (!result.cancelled) {
          await uploadAttachment({ result, ...params })
        }
      } else if (buttonIndex === 1) {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          exif: false
        })

        if (!result.cancelled) {
          await uploadAttachment({ result, ...params })
        }
      }
    }
  )
}

export default addAttachments
