import mediaSelector from '@components/mediaSelector'
import { MenuRow } from '@components/Menu'
import { displayMessage } from '@components/Message'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { useProfileMutation, useProfileQuery } from '@utils/queryHooks/profile'
import { useTheme } from '@utils/styles/ThemeManager'
import * as ImagePicker from 'expo-image-picker'
import React, { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import FlashMessage from 'react-native-flash-message'

export interface Props {
  type: 'avatar' | 'header'
  messageRef: RefObject<FlashMessage>
}

const ProfileAvatarHeader: React.FC<Props> = ({ type, messageRef }) => {
  const { mode } = useTheme()
  const { t } = useTranslation('screenTabs')

  const { showActionSheetWithOptions } = useActionSheet()

  const query = useProfileQuery({})
  const mutation = useProfileMutation()

  return (
    <MenuRow
      title={t(`me.profile.root.${type}.title`)}
      description={t(`me.profile.root.${type}.description`)}
      loading={query.isLoading || mutation.isLoading}
      iconBack='ChevronRight'
      onPress={async () => {
        const image = await mediaSelector({
          showActionSheetWithOptions,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          resize: { width: 400, height: 400 }
        })
        mutation
          .mutateAsync({ type, data: image.uri })
          .then(() =>
            displayMessage({
              ref: messageRef,
              message: t('me.profile.feedback.succeed', {
                type: t(`me.profile.root.${type}.title`)
              }),
              mode,
              type: 'success'
            })
          )
          .catch(err =>
            displayMessage({
              ref: messageRef,
              message: t('me.profile.feedback.failed', {
                type: t(`me.profile.root.${type}.title`)
              }),
              ...(err && { description: err }),
              mode,
              type: 'error'
            })
          )
      }}
    />
  )
}

export default ProfileAvatarHeader
