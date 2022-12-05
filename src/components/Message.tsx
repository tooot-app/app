import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { RefObject } from 'react'
import { AccessibilityInfo } from 'react-native'
import FlashMessage, { MessageType, showMessage } from 'react-native-flash-message'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import haptics from './haptics'

const displayMessage = ({
  ref,
  duration = 'short',
  autoHide = true,
  message,
  description,
  onPress,
  type
}: {
  ref?: RefObject<FlashMessage>
  duration?: 'short' | 'long'
  autoHide?: boolean
  message: string
  description?: string
  onPress?: () => void
  type?: MessageType
}) => {
  AccessibilityInfo.announceForAccessibility(message + '.' + description)

  if (type && type === 'danger') {
    haptics('Error')
  }

  if (ref) {
    ref.current?.showMessage({
      duration: type === 'danger' ? 8000 : duration === 'short' ? 3000 : 5000,
      autoHide,
      message,
      description,
      onPress,
      type
    })
  } else {
    showMessage({
      duration: type === 'danger' ? 8000 : duration === 'short' ? 3000 : 5000,
      autoHide,
      message,
      description,
      onPress,
      type
    })
  }
}

const Message = React.forwardRef<FlashMessage>((_, ref) => {
  const { colors, theme } = useTheme()
  const insets = useSafeAreaInsets()

  enum iconMapping {
    success = 'CheckCircle',
    danger = 'XCircle',
    warning = 'AlertCircle',
    none = '',
    default = '',
    info = '',
    auto = ''
  }
  enum colorMapping {
    success = 'blue',
    danger = 'red',
    warning = 'secondary',
    none = 'secondary',
    default = 'secondary',
    info = 'secondary',
    auto = 'secondary'
  }

  return (
    <FlashMessage
      ref={ref}
      icon='auto'
      renderFlashMessageIcon={type => {
        return typeof type === 'string' && ['success', 'danger', 'warning'].includes(type) ? (
          <Icon
            name={iconMapping[type]}
            size={StyleConstants.Font.LineHeight.M}
            color={colors[colorMapping[type]]}
            style={{ marginRight: StyleConstants.Spacing.S }}
          />
        ) : null
      }}
      position='top'
      floating
      style={{
        backgroundColor: colors.backgroundDefault,
        shadowColor: colors.primaryDefault,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: theme === 'light' ? 0.16 : 0.24,
        shadowRadius: 4,
        paddingRight: StyleConstants.Spacing.M * 2,
        marginTop: ref ? undefined : insets.top
      }}
      titleStyle={{
        color: colors.primaryDefault,
        ...StyleConstants.FontStyle.M,
        fontWeight: StyleConstants.Font.Weight.Bold
      }}
      textStyle={{
        color: colors.primaryDefault,
        ...StyleConstants.FontStyle.S
      }}
      // @ts-ignore
      textProps={{ numberOfLines: 2 }}
    />
  )
})

export { Message, displayMessage }
