import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { getTheme } from '@utils/styles/themes'
import React from 'react'
import FlashMessage, { showMessage } from 'react-native-flash-message'
import haptics from './haptics'

const displayMessage = ({
  autoHide = true,
  message,
  description,
  onPress,
  mode,
  type
}:
  | {
      autoHide?: boolean
      message: string
      description?: string
      onPress?: () => void
      mode?: undefined
      type?: undefined
    }
  | {
      autoHide?: boolean
      message: string
      description?: string
      onPress?: () => void
      mode: 'light' | 'dark'
      type: 'success' | 'error' | 'warning'
    }) => {
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

  showMessage({
    autoHide,
    message,
    description,
    onPress,
    ...(mode &&
      type && {
        renderFlashMessageIcon: props => {
          console.log(props)
          return (
            <Icon
              name={iconMapping[type]}
              size={StyleConstants.Font.LineHeight.M}
              color={getTheme(mode)[colorMapping[type]]}
              style={{ marginRight: StyleConstants.Spacing.S }}
            />
          )
        }
      })
  })
}

const Message = React.memo(
  () => {
    const { mode, theme } = useTheme()

    return (
      <FlashMessage
        icon='auto'
        position='top'
        floating
        style={{
          backgroundColor: theme.background,
          shadowColor: theme.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: mode === 'light' ? 0.16 : 0.32,
          shadowRadius: 4
        }}
        titleStyle={{
          color: theme.primary,
          ...StyleConstants.FontStyle.M,
          fontWeight: StyleConstants.Font.Weight.Bold
        }}
        textStyle={{ color: theme.primary, ...StyleConstants.FontStyle.M }}
        // @ts-ignore
        textProps={{ numberOfLines: 2 }}
      />
    )
  },
  () => true
)

export { Message, displayMessage }
