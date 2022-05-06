import analytics from '@components/analytics'
import Button from '@components/Button'
import openLink from '@components/openLink'
import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { Blurhash } from 'react-native-blurhash'
import attachmentAspectRatio from './aspectRatio'

export interface Props {
  total: number
  index: number
  sensitiveShown: boolean
  attachment: Mastodon.AttachmentUnknown
}

const AttachmentUnsupported: React.FC<Props> = ({
  total,
  index,
  sensitiveShown,
  attachment
}) => {
  const { t } = useTranslation('componentTimeline')
  const { colors } = useTheme()

  return (
    <View
      style={{
        flex: 1,
        flexBasis: '50%',
        padding: StyleConstants.Spacing.XS / 2,
        justifyContent: 'center',
        alignItems: 'center',
        aspectRatio: attachmentAspectRatio({ total, index })
      }}
    >
      {attachment.blurhash ? (
        <Blurhash
          blurhash={attachment.blurhash}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%'
          }}
        />
      ) : null}
      {!sensitiveShown ? (
        <>
          <CustomText
            fontStyle='S'
            style={{
              textAlign: 'center',
              marginBottom: StyleConstants.Spacing.S,
              color: attachment.blurhash
                ? colors.backgroundDefault
                : colors.primaryDefault
            }}
          >
            {t('shared.attachment.unsupported.text')}
          </CustomText>
          {attachment.remote_url ? (
            <Button
              type='text'
              content={t('shared.attachment.unsupported.button')}
              size='S'
              overlay
              onPress={() => {
                analytics('timeline_shared_attachment_unsupported_press')
                attachment.remote_url && openLink(attachment.remote_url)
              }}
            />
          ) : null}
        </>
      ) : null}
    </View>
  )
}

export default AttachmentUnsupported
