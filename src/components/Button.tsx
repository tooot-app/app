import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useState } from 'react'
import { AccessibilityProps, Pressable, StyleProp, View, ViewStyle } from 'react-native'
import { Loading } from './Loading'
import CustomText from './Text'

export interface Props {
  accessibilityLabel?: AccessibilityProps['accessibilityLabel']
  accessibilityHint?: AccessibilityProps['accessibilityHint']

  style?: StyleProp<ViewStyle>

  type: 'icon' | 'text'
  content: string

  selected?: boolean
  loading?: boolean
  destructive?: boolean
  disabled?: boolean

  strokeWidth?: number
  size?: 'S' | 'M' | 'L'
  fontBold?: boolean
  spacing?: 'XS' | 'S' | 'M' | 'L'
  round?: boolean
  overlay?: boolean

  onPress: () => void
}

const Button: React.FC<Props> = ({
  accessibilityLabel,
  accessibilityHint,
  style: customStyle,
  type,
  content,
  selected,
  loading = false,
  destructive = false,
  disabled = false,
  strokeWidth,
  size = 'M',
  fontBold = false,
  spacing = 'S',
  round = false,
  overlay = false,
  onPress
}) => {
  const { colors } = useTheme()

  const loadingSpinkit = () =>
    loading ? (
      <View style={{ position: 'absolute' }}>
        <Loading />
      </View>
    ) : null

  const mainColor = () => {
    if (selected) {
      return colors.blue
    } else if (overlay) {
      return colors.primaryOverlay
    } else if (disabled || loading) {
      return colors.disabled
    } else {
      if (destructive) {
        return colors.red
      } else {
        return colors.primaryDefault
      }
    }
  }

  const children = () => {
    switch (type) {
      case 'icon':
        return (
          <>
            <Icon
              name={content}
              color={mainColor()}
              strokeWidth={strokeWidth}
              style={{ opacity: loading ? 0 : 1 }}
              size={StyleConstants.Font.Size[size] * (size === 'L' ? 1.25 : 1)}
            />
            {loadingSpinkit()}
          </>
        )
      case 'text':
        return (
          <>
            <CustomText
              style={{
                color: mainColor(),
                fontSize: StyleConstants.Font.Size[size] * (size === 'L' ? 1.25 : 1),
                opacity: loading ? 0 : 1
              }}
              fontWeight={fontBold || selected ? 'Bold' : 'Normal'}
              children={content}
              testID='text'
            />
            {loadingSpinkit()}
          </>
        )
    }
  }

  const [layoutHeight, setLayoutHeight] = useState<number | undefined>()

  return (
    <Pressable
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole='button'
      accessibilityState={{
        selected,
        disabled: disabled || selected,
        busy: loading
      }}
      style={[
        {
          borderRadius: 100,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: overlay ? 0 : selected ? 1.5 : 1,
          borderColor: mainColor(),
          backgroundColor: overlay ? colors.backgroundOverlayInvert : colors.backgroundDefault,
          paddingVertical: StyleConstants.Spacing[spacing],
          paddingHorizontal: StyleConstants.Spacing[spacing] + StyleConstants.Spacing.XS,
          width: round && layoutHeight ? layoutHeight : undefined
        },
        customStyle
      ]}
      {...(round && {
        onLayout: ({ nativeEvent }) => setLayoutHeight(nativeEvent.layout.height)
      })}
      testID='base'
      onPress={onPress}
      children={children()}
      disabled={selected || disabled || loading}
    />
  )
}

export default Button
