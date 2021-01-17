import Button from '@components/Button'
import openLink from '@components/openLink'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { Blurhash } from 'gl-react-blurhash'
import { Surface } from 'gl-react-expo'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
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
  const { t } = useTranslation('timeline')
  const { theme } = useTheme()

  return (
    <View
      style={[
        styles.base,
        { aspectRatio: attachmentAspectRatio({ total, index }) }
      ]}
    >
      {attachment.blurhash ? (
        <Surface
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%'
          }}
        >
          <Blurhash hash={attachment.blurhash} />
        </Surface>
      ) : null}
      {!sensitiveShown ? (
        <>
          <Text
            style={[
              styles.text,
              { color: attachment.blurhash ? theme.background : theme.primary }
            ]}
          >
            {t('shared.attachment.unsupported.text')}
          </Text>
          {attachment.remote_url ? (
            <Button
              type='text'
              content={t('shared.attachment.unsupported.button')}
              size='S'
              overlay
              onPress={async () => await openLink(attachment.remote_url!)}
            />
          ) : null}
        </>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexBasis: '50%',
    padding: StyleConstants.Spacing.XS / 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    ...StyleConstants.FontStyle.S,
    textAlign: 'center',
    marginBottom: StyleConstants.Spacing.S
  }
})

export default AttachmentUnsupported
