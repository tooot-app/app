import Button from '@components/Button'
import { StyleConstants } from '@utils/styles/constants'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

export interface Props {
  sensitiveShown: boolean
  text?: string
}

const AttachmentAltText: React.FC<Props> = ({ sensitiveShown, text }) => {
  if (!text) {
    return null
  }

  const { t } = useTranslation('componentTimeline')

  return !sensitiveShown ? (
    <Button
      style={{
        position: 'absolute',
        right: StyleConstants.Spacing.S,
        bottom: StyleConstants.Spacing.S
      }}
      overlay
      size='S'
      type='text'
      content='ALT'
      fontBold
      onPress={() => Alert.alert(t('shared.attachment.altText'), text)}
    />
  ) : null
}

export default AttachmentAltText
