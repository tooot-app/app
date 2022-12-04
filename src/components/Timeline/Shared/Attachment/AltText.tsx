import Button from '@components/Button'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '@utils/navigation/navigators'
import { StyleConstants } from '@utils/styles/constants'

export interface Props {
  sensitiveShown: boolean
  text?: string
}

const AttachmentAltText: React.FC<Props> = ({ sensitiveShown, text }) => {
  if (!text) {
    return null
  }

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

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
      onPress={() => navigation.navigate('Screen-Actions', { type: 'alt_text', text })}
    />
  ) : null
}

export default AttachmentAltText
