import mediaSelector from '@components/mediaSelector'
import { MenuRow } from '@components/Menu'
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
        mutation.mutate({
          mode,
          messageRef,
          message: {
            text: `me.profile.root.${type}.title`,
            succeed: true,
            failed: true
          },
          type,
          data: image.uri
        })
      }}
    />
  )
}

export default ProfileAvatarHeader
