import * as ImagePicker from 'expo-image-picker'
import { Alert, Linking } from 'react-native'
import { ActionSheetOptions } from '@expo/react-native-action-sheet'
import i18next from 'i18next'
import analytics from '@components/analytics'
import { ImageInfo } from 'expo-image-picker/build/ImagePicker.types'

export interface Props {
  mediaTypes?: ImagePicker.MediaTypeOptions
  uploader: (imageInfo: ImageInfo) => void
  showActionSheetWithOptions: (
    options: ActionSheetOptions,
    callback: (i: number) => void
  ) => void
}

const mediaSelector = async ({
  mediaTypes = ImagePicker.MediaTypeOptions.All,
  uploader,
  showActionSheetWithOptions
}: Props): Promise<any> => {
  showActionSheetWithOptions(
    {
      title: i18next.t('componentMediaSelector:title'),
      options: [
        i18next.t('componentMediaSelector:options.library'),
        i18next.t('componentMediaSelector:options.photo'),
        i18next.t('componentMediaSelector:options.cancel')
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
            i18next.t('componentMediaSelector:library.alert.title'),
            i18next.t('componentMediaSelector:library.alert.message'),
            [
              {
                text: i18next.t(
                  'componentMediaSelector:library.alert.buttons.cancel'
                ),
                style: 'cancel',
                onPress: () =>
                  analytics('mediaSelector_nopermission', { action: 'cancel' })
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
        } else {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes,
            exif: false
          })

          if (!result.cancelled) {
            // https://github.com/expo/expo/issues/11214
            const fixResult = {
              ...result,
              uri: result.uri.replace('file:/data', 'file:///data')
            }
            uploader(fixResult)
            return
          }
        }
      } else if (buttonIndex === 1) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert(
            i18next.t('componentMediaSelector:photo.alert.title'),
            i18next.t('componentMediaSelector:photo.alert.message'),
            [
              {
                text: i18next.t(
                  'componentMediaSelector:photo.alert.buttons.cancel'
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
                  'componentMediaSelector:photo.alert.buttons.settings'
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
            mediaTypes,
            exif: false
          })

          if (!result.cancelled) {
            // https://github.com/expo/expo/issues/11214
            const fixResult = {
              ...result,
              uri: result.uri.replace('file:/data', 'file:///data')
            }
            uploader(fixResult)
            return
          }
        }
      }
    }
  )
}

export default mediaSelector
