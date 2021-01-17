import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect, useMemo, useRef } from 'react'
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from 'react-native'
import { Chase } from 'react-native-animated-spinkit'

export interface Props {
  style?: StyleProp<ViewStyle>

  type: 'icon' | 'text'
  content: string

  loading?: boolean
  destructive?: boolean
  disabled?: boolean
  active?: boolean

  strokeWidth?: number
  size?: 'S' | 'M' | 'L'
  spacing?: 'XS' | 'S' | 'M' | 'L'
  round?: boolean
  overlay?: boolean

  onPress: () => void
}

const Button: React.FC<Props> = ({
  style: customStyle,
  type,
  content,
  loading = false,
  destructive = false,
  disabled = false,
  active = false,
  strokeWidth,
  size = 'M',
  spacing = 'S',
  round = false,
  overlay = false,
  onPress
}) => {
  const { theme } = useTheme()

  const mounted = useRef(false)
  useEffect(() => {
    if (mounted.current) {
      layoutAnimation()
    } else {
      mounted.current = true
    }
  }, [content, loading, disabled, active])

  const loadingSpinkit = useMemo(
    () => (
      <View style={{ position: 'absolute' }}>
        <Chase size={StyleConstants.Font.Size[size]} color={theme.secondary} />
      </View>
    ),
    [theme]
  )

  const colorContent = useMemo(() => {
    if (active) {
      return theme.blue
    } else {
      if (overlay) {
        return theme.primaryOverlay
      } else {
        if (disabled) {
          return theme.secondary
        } else {
          if (destructive) {
            return theme.red
          } else {
            return theme.primary
          }
        }
      }
    }
  }, [theme, disabled])
  const colorBorder = useMemo(() => {
    if (active) {
      return theme.blue
    } else {
      if (disabled || loading) {
        return theme.secondary
      } else {
        if (destructive) {
          return theme.red
        } else {
          return theme.primary
        }
      }
    }
  }, [theme, loading, disabled])
  const colorBackground = useMemo(() => {
    if (overlay) {
      return theme.backgroundOverlay
    } else {
      return theme.background
    }
  }, [theme])

  const children = useMemo(() => {
    switch (type) {
      case 'icon':
        return (
          <>
            <Icon
              name={content}
              color={colorContent}
              strokeWidth={strokeWidth}
              style={{ opacity: loading ? 0 : 1 }}
              size={StyleConstants.Font.Size[size] * (size === 'L' ? 1.25 : 1)}
            />
            {loading ? loadingSpinkit : null}
          </>
        )
      case 'text':
        return (
          <>
            <Text
              style={{
                color: colorContent,
                fontSize:
                  StyleConstants.Font.Size[size] * (size === 'L' ? 1.25 : 1),
                fontWeight: destructive
                  ? StyleConstants.Font.Weight.Bold
                  : undefined,
                opacity: loading ? 0 : 1
              }}
              children={content}
              testID='text'
            />
            {loading ? loadingSpinkit : null}
          </>
        )
    }
  }, [theme, content, loading, disabled, active])

  enum spacingMapping {
    XS = 'S',
    S = 'M',
    M = 'L',
    L = 'XL'
  }

  return (
    <Pressable
      style={[
        styles.button,
        {
          borderWidth: overlay ? 0 : 1,
          borderColor: colorBorder,
          backgroundColor: colorBackground,
          paddingVertical: StyleConstants.Spacing[spacing],
          paddingHorizontal:
            StyleConstants.Spacing[round ? spacing : spacingMapping[spacing]]
        },
        customStyle
      ]}
      testID='base'
      onPress={onPress}
      children={children}
      disabled={disabled || active || loading}
    />
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default Button
