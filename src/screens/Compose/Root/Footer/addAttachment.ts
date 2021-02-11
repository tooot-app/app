import client from '@api/client'
import * as ImagePicker from 'expo-image-picker'
import * as Crypto from 'expo-crypto'
import { ImageInfo } from 'expo-image-picker/build/ImagePicker.types'
import * as VideoThumbnails from 'expo-video-thumbnails'
import { Dispatch } from 'react'
import { Alert, Linking } from 'react-native'
import { ComposeAction } from '../../utils/types'
import { ActionSheetOptions } from '@expo/react-native-action-sheet'
import i18next from 'i18next'
import analytics from '@components/analytics'

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
  const uploadAttachment = async (result: ImageInfo) => {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      result.uri + Math.random()
    )

    let attachmentType: string
    // https://github.com/expo/expo/issues/11214
    const attachmentUri = result.uri.replace('file:/data', 'file:///data')

    switch (result.type) {
      case 'image':
        attachmentType = `image/${attachmentUri.split('.')[1]}`
        composeDispatch({
          type: 'attachment/upload/start',
          payload: {
            local: { ...result, local_thumbnail: attachmentUri, hash },
            uploading: true
          }
        })
        break
      case 'video':
        attachmentType = `video/${attachmentUri.split('.')[1]}`
        VideoThumbnails.getThumbnailAsync(attachmentUri)
          .then(({ uri }) =>
            composeDispatch({
              type: 'attachment/upload/start',
              payload: {
                local: { ...result, local_thumbnail: uri, hash },
                uploading: true
              }
            })
          )
          .catch(() =>
            composeDispatch({
              type: 'attachment/upload/start',
              payload: {
                local: { ...result, hash },
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
            local: { ...result, hash },
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
          'sharedCompose:content.root.actions.attachment.failed.alert.title'
        ),
        undefined,
        [
          {
            text: i18next.t(
              'sharedCompose:content.root.actions.attachment.failed.alert.button'
            ),
            onPress: () => {}
          }
        ]
      )
    }

    const formData = new FormData()
    formData.append('file', {
      // @ts-ignore
      uri: attachmentUri,
      name: attachmentType,
      type: attachmentType
    })

    return client<Mastodon.Attachment>({
      method: 'post',
      instance: 'local',
      url: 'media',
      body: formData
    })
      .then(res => {
        if (res.body.id) {
          composeDispatch({
            type: 'attachment/upload/end',
            payload: { remote: res.body, local: result }
          })
        } else {
          uploadFailed()
        }
      })
      .catch(() => {
        uploadFailed()
      })
  }

  showActionSheetWithOptions(
    {
      options: [
        i18next.t(
          'sharedCompose:content.root.actions.attachment.actions.options.library'
        ),
        i18next.t(
          'sharedCompose:content.root.actions.attachment.actions.options.photo'
        ),
        i18next.t(
          'sharedCompose:content.root.actions.attachment.actions.options.cancel'
        )
      ],
      cancelButtonIndex: 2
    },
    async buttonIndex => {
      if (buttonIndex === 0) {
        const {
          status
        } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert(
            i18next.t(
              'sharedCompose:content.root.actions.attachment.actions.library.alert.title'
            ),
            i18next.t(
              'sharedCompose:content.root.actions.attachment.actions.library.alert.message'
            ),
            [
              {
                text: i18next.t(
                  'sharedCompose:content.root.actions.attachment.actions.library.alert.buttons.cancel'
                ),
                style: 'cancel',
                onPress: () => {
                  analytics('compose_addattachment_medialibrary_nopermission', {
                    action: 'cancel'
                  })
                }
              },
              {
                text: i18next.t(
                  'sharedCompose:content.root.actions.attachment.actions.library.alert.buttons.settings'
                ),
                style: 'default',
                onPress: () => {
                  analytics('compose_addattachment_medialibrary_nopermission', {
                    action: 'settings'
                  })
                  Linking.openURL('app-settings:')
                }
              }
            ]
          )
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
          Alert.alert(
            i18next.t(
              'sharedCompose:content.root.actions.attachment.actions.photo.alert.title'
            ),
            i18next.t(
              'sharedCompose:content.root.actions.attachment.actions.photo.alert.message'
            ),
            [
              {
                text: i18next.t(
                  'sharedCompose:content.root.actions.attachment.actions.photo.alert.buttons.cancel'
                ),
                style: 'cancel',
                onPress: () => {
                  analytics('compose_addattachment_camera_nopermission', {
                    action: 'cancel'
                  })
                }
              },
              {
                text: i18next.t(
                  'sharedCompose:content.root.actions.attachment.actions.photo.alert.buttons.settings'
                ),
                style: 'default',
                onPress: () => {
                  analytics('compose_addattachment_camera_nopermission', {
                    action: 'settings'
                  })
                  Linking.openURL('app-settings:')
                }
              }
            ]
          )
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
