import mediaSelector from '@components/mediaSelector'
import { MenuRow } from '@components/Menu'
import { displayMessage } from '@components/Message'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { useProfileMutation, useProfileQuery } from '@utils/queryHooks/profile'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import FlashMessage from 'react-native-flash-message'

export interface Props {
  type: 'avatar' | 'header'
  messageRef: RefObject<FlashMessage>
}

const ProfileAvatarHeader: React.FC<Props> = ({ type, messageRef }) => {
  const { theme } = useTheme()
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
          mediaType: 'photo',
          maximum: 1,
          showActionSheetWithOptions,
          resize:
            type === 'avatar'
              ? { width: 400, height: 400 }
              : { width: 1500, height: 500 }
        })
        if (image[0].uri) {
          mutation.mutate({
            theme,
            messageRef,
            message: {
              text: `me.profile.root.${type}.title`,
              succeed: true,
              failed: true
            },
            type,
            data: image[0].uri
          })
        } else {
          displayMessage({
            ref: messageRef,
            message: t('screenTabs:me.profile.mediaSelectionFailed'),
            theme: theme,
            type: 'error'
          })
        }
      }}
    />
  )
}

export default ProfileAvatarHeader
