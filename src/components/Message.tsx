import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { getColors, Theme } from '@utils/styles/themes'
import React, { RefObject } from 'react'
import { AccessibilityInfo } from 'react-native'
import FlashMessage, {
  hideMessage,
  showMessage
} from 'react-native-flash-message'
import haptics from './haptics'

const displayMessage = ({
  ref,
  duration = 'short',
  autoHide = true,
  message,
  description,
  onPress,
  theme,
  type
}:
  | {
      ref?: RefObject<FlashMessage>
      duration?: 'short' | 'long'
      autoHide?: boolean
      message: string
      description?: string
      onPress?: () => void
      theme?: undefined
      type?: undefined
    }
  | {
      ref?: RefObject<FlashMessage>
      duration?: 'short' | 'long'
      autoHide?: boolean
      message: string
      description?: string
      onPress?: () => void
      theme: Theme
      type: 'success' | 'error' | 'warning'
    }) => {
  AccessibilityInfo.announceForAccessibility(message + '.' + description)

  enum iconMapping {
    success = 'CheckCircle',
    error = 'XCircle',
    warning = 'AlertCircle'
  }
  enum colorMapping {
    success = 'blue',
    error = 'red',
    warning = 'secondary'
  }

  if (type && type === 'error') {
    haptics('Error')
  }

  if (ref) {
    ref.current?.showMessage({
      duration: type === 'error' ? 5000 : duration === 'short' ? 1500 : 3000,
      autoHide,
      message,
      description,
      onPress,
      ...(theme &&
        type && {
          renderFlashMessageIcon: () => {
            return (
              <Icon
                name={iconMapping[type]}
                size={StyleConstants.Font.LineHeight.M}
                color={getColors(theme)[colorMapping[type]]}
                style={{ marginRight: StyleConstants.Spacing.S }}
              />
            )
          }
        })
    })
  } else {
    showMessage({
      duration: type === 'error' ? 3500 : duration === 'short' ? 1500 : 2500,
      autoHide,
      message,
      description,
      onPress,
      ...(theme &&
        type && {
          renderFlashMessageIcon: () => {
            return (
              <Icon
                name={iconMapping[type]}
                size={StyleConstants.Font.LineHeight.M}
                color={getColors(theme)[colorMapping[type]]}
                style={{ marginRight: StyleConstants.Spacing.S }}
              />
            )
          }
        })
    })
  }
}

const removeMessage = () => {
  // if (ref) {
  //   ref.current?.hideMessage()
  // } else {
  hideMessage()
  // }
}

const Message = React.forwardRef<FlashMessage>((_, ref) => {
  const { colors, theme } = useTheme()

  return (
    <FlashMessage
      ref={ref}
      icon='auto'
      position='top'
      floating
      style={{
        backgroundColor: colors.backgroundDefault,
        shadowColor: colors.primaryDefault,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: theme === 'light' ? 0.16 : 0.24,
        shadowRadius: 4
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

export { Message, displayMessage, removeMessage }
