import { Dispatch } from 'react'
import { ActionSheetIOS, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { ImageInfo } from 'expo-image-picker/build/ImagePicker.types'

import { PostAction, PostState } from '../PostToot'
import client from 'src/api/client'

const uploadAttachment = async (uri: ImageInfo['uri']) => {
  const filename = uri.split('/').pop()

  const match = /\.(\w+)$/.exec(filename!)
  const type = match ? `image/${match[1]}` : `image`

  const formData = new FormData()
  formData.append('file', { uri: uri, name: filename, type: type })

  return client({
    method: 'post',
    instance: 'local',
    endpoint: 'media',
    body: formData
  })
    .then(res => {
      if (res.body.id && res.body.type !== 'unknown') {
        console.log('url: ' + res.body.preview_url)
        return Promise.resolve({
          id: res.body.id,
          url: res.body.url,
          preview_url: res.body.preview_url,
          description: res.body.description
        })
      } else {
        Alert.alert('上传失败', '', [
          {
            text: '返回重试'
          }
        ])
        return Promise.reject()
      }
    })
    .catch(() => {
      Alert.alert('上传失败', '', [
        {
          text: '返回重试'
        }
      ])
      return Promise.reject()
    })
}

const addAttachments = async ({
  postState,
  postDispatch
}: {
  postState: PostState
  postDispatch: Dispatch<PostAction>
}) => {
  ActionSheetIOS.showActionSheetWithOptions(
    {
      options: ['从相册选取', '现照', '取消'],
      cancelButtonIndex: 2
    },
    async buttonIndex => {
      if (buttonIndex === 0) {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          exif: false
        })

        if (!result.cancelled) {
          const response = await uploadAttachment(result.uri)
          if (response.id) {
            postDispatch({
              type: 'attachments/add',
              payload: response
            })
          }
        }
      } else if (buttonIndex === 1) {
        // setResult(Math.floor(Math.random() * 100) + 1)
      }
    }
  )
}

export default addAttachments
