import Button from '@components/Button'
import GracefullyImage from '@components/GracefullyImage'
import openLink from '@components/openLink'
import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import StatusContext from '../Context'
import AttachmentAltText from './AltText'
import { aspectRatio } from './dimensions'

export interface Props {
  total: number
  index: number
  sensitiveShown: boolean
  attachment: Mastodon.AttachmentUnknown
}

const AttachmentUnsupported: React.FC<Props> = ({ total, index, sensitiveShown, attachment }) => {
  const { inThread } = useContext(StatusContext)
  const { t } = useTranslation('componentTimeline')
  const { colors } = useTheme()

  return (
    <View
      style={{
        flex: 1,
        aspectRatio: aspectRatio({ total, index, ...attachment.meta?.original }),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: StyleConstants.BorderRadius / 2,
        overflow: 'hidden'
      }}
    >
      {attachment.blurhash ? (
        <GracefullyImage
          sources={{ blurhash: attachment.blurhash }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          dim
          withoutTransition={inThread}
        />
      ) : null}
      {!sensitiveShown ? (
        <>
          <CustomText
            fontStyle='S'
            style={{
              textAlign: 'center',
              marginBottom: StyleConstants.Spacing.S,
              color: attachment.blurhash ? colors.backgroundDefault : colors.primaryDefault
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
                attachment.remote_url && openLink(attachment.remote_url)
              }}
            />
          ) : null}
        </>
      ) : null}
      <AttachmentAltText sensitiveShown={sensitiveShown} text={attachment.description} />
    </View>
  )
}

export default AttachmentUnsupported
