import analytics from '@components/analytics'
import { ActionSheetOptions } from '@expo/react-native-action-sheet'
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'
import { ImageInfo } from 'expo-image-picker/build/ImagePicker.types'
import i18next from 'i18next'
import { Alert, Linking, Platform } from 'react-native'

export interface Props {
  mediaTypes?: ImagePicker.MediaTypeOptions
  resize?: { width?: number; height?: number } // Resize mode contain
  showActionSheetWithOptions: (
    options: ActionSheetOptions,
    callback: (i?: number | undefined) => void | Promise<void>
  ) => void
}

const mediaSelector = async ({
  mediaTypes = ImagePicker.MediaTypeOptions.All,
  resize,
  showActionSheetWithOptions
}: Props): Promise<ImageInfo> => {
  return new Promise((resolve, reject) => {
    const resolveResult = async (result: ImageInfo) => {
      if (resize && result.type === 'image') {
        let newResult: ImageManipulator.ImageResult
        if (resize.width && resize.height) {
          if (resize.width / resize.height > result.width / result.height) {
            newResult = await ImageManipulator.manipulateAsync(result.uri, [
              { resize: { width: resize.width } }
            ])
          } else {
            newResult = await ImageManipulator.manipulateAsync(result.uri, [
              { resize: { height: resize.height } }
            ])
          }
        } else {
          newResult = await ImageManipulator.manipulateAsync(result.uri, [
            { resize }
          ])
        }
        resolve(newResult)
      } else {
        resolve(result)
      }
    }

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
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync()
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
                    analytics('mediaSelector_nopermission', {
                      action: 'cancel'
                    })
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
              exif: false,
              presentationStyle:
                Platform.OS === 'ios' && parseInt(Platform.Version) < 13
                  ? 0
                  : -2
            })

            if (!result.cancelled) {
              await resolveResult(result)
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
              await resolveResult(result)
            }
          }
        }
      }
    )
  })
}

export default mediaSelector
