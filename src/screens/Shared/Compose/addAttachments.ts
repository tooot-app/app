import { Dispatch } from 'react'
import { ActionSheetIOS, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

import { PostAction, PostState } from '../Compose'
import client from 'src/api/client'
import { ImageInfo } from 'expo-image-picker/build/ImagePicker.types'

const uploadAttachment = async ({
  result,
  postState,
  postDispatch
}: {
  result: NonNullable<ImageInfo>
  postState: PostState
  postDispatch: Dispatch<PostAction>
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
      postDispatch({
        type: 'attachmentUploadProgress',
        payload: {
          progress: p.loaded / p.total,
          aspect: result.width / result.height
        }
      })
    }
  })
    .then(({ body }: { body: Mastodon.Attachment & { local_url: string } }) => {
      postDispatch({
        type: 'attachmentUploadProgress',
        payload: undefined
      })
      if (body.id) {
        body.local_url = result.uri
        postDispatch({
          type: 'attachments',
          payload: postState.attachments.concat([body])
        })
        return Promise.resolve()
      } else {
        Alert.alert('上传失败', '', [
          {
            text: '返回重试',
            onPress: () =>
              postDispatch({
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
            postDispatch({
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
  postState: PostState
  postDispatch: Dispatch<PostAction>
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
          console.log(result)
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
