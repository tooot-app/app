import client from '@api/client'
import * as ImagePicker from 'expo-image-picker'
import { ImageInfo } from 'expo-image-picker/build/ImagePicker.types'
import * as VideoThumbnails from 'expo-video-thumbnails'
import { Dispatch } from 'react'
import { ActionSheetIOS, Alert, Linking } from 'react-native'
import { ComposeAction } from './utils/types'

export interface Props {
  composeDispatch: Dispatch<ComposeAction>
}

const addAttachment = async ({ composeDispatch }: Props): Promise<any> => {
  const uploadAttachment = (result: ImageInfo) => {
    switch (result.type) {
      case 'image':
        composeDispatch({
          type: 'attachment/upload/start',
          payload: {
            local: { ...result, local_thumbnail: result.uri },
            uploading: true
          }
        })
        break
      case 'video':
        VideoThumbnails.getThumbnailAsync(result.uri)
          .then(({ uri }) =>
            composeDispatch({
              type: 'attachment/upload/start',
              payload: {
                local: { ...result, local_thumbnail: uri },
                uploading: true
              }
            })
          )
          .catch(() =>
            composeDispatch({
              type: 'attachment/upload/start',
              payload: {
                local: result,
                uploading: true
              }
            })
          )
        break
      default:
        composeDispatch({
          type: 'attachment/upload/start',
          payload: {
            local: result,
            uploading: true
          }
        })
        break
    }

    const formData = new FormData()
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
      body: formData
    })
      .then(({ body }: { body: Mastodon.Attachment }) => {
        if (body.id) {
          composeDispatch({
            type: 'attachment/upload/end',
            payload: { remote: body, local: result }
          })
          return Promise.resolve()
        } else {
          Alert.alert('上传失败', '', [
            {
              text: '返回重试',
              onPress: () => {}
            }
          ])
          return Promise.reject()
        }
      })
      .catch(() => {
        Alert.alert('上传失败', '', [
          {
            text: '返回重试',
            onPress: () => {}
          }
        ])
        return Promise.reject()
      })
  }

  ActionSheetIOS.showActionSheetWithOptions(
    {
      options: ['从相册选取', '现照', '取消'],
      cancelButtonIndex: 2
    },
    async buttonIndex => {
      if (buttonIndex === 0) {
        const {
          status
        } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert('🈚️读取权限', '需要相片权限才能上传照片', [
            {
              text: '取消',
              style: 'cancel',
              onPress: () => {}
            },
            {
              text: '去系统设置',
              style: 'default',
              onPress: () => Linking.openURL('app-settings:')
            }
          ])
        } else {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            exif: false
          })

          if (!result.cancelled) {
            uploadAttachment(result)
          }
        }
      } else if (buttonIndex === 1) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert('🈚️读取权限', '需要相机权限才能上传照片', [
            {
              text: '取消',
              style: 'cancel',
              onPress: () => {}
            },
            {
              text: '去系统设置',
              style: 'default',
              onPress: () => Linking.openURL('app-settings:')
            }
          ])
        } else {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            exif: false
          })

          if (!result.cancelled) {
            uploadAttachment(result)
          }
        }
      }
    }
  )
}

export default addAttachment
