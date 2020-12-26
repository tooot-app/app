import { Feather } from '@expo/vector-icons'
import React, { useLayoutEffect, useMemo } from 'react'
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from 'react-native'
import { Chase } from 'react-native-animated-spinkit'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import layoutAnimation from '@root/utils/styles/layoutAnimation'

export interface Props {
  style?: StyleProp<ViewStyle>

  type: 'icon' | 'text'
  content: string

  loading?: boolean
  destructive?: boolean
  disabled?: boolean

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
  size = 'M',
  spacing = 'S',
  round = false,
  overlay = false,
  onPress
}) => {
  const { theme } = useTheme()

  useLayoutEffect(() => layoutAnimation(), [loading, disabled])

  const loadingSpinkit = useMemo(
    () => (
      <View style={{ position: 'absolute' }}>
        <Chase size={StyleConstants.Font.Size[size]} color={theme.secondary} />
      </View>
    ),
    [theme]
  )

  const colorContent = useMemo(() => {
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
  }, [theme, disabled])

  const children = useMemo(() => {
    switch (type) {
      case 'icon':
        return (
          <>
            <Feather
              name={content as any}
              size={StyleConstants.Font.Size[size] * (size === 'M' ? 1 : 1.5)}
              color={colorContent}
              style={{ opacity: loading ? 0 : 1 }}
            />
            {loading && loadingSpinkit}
          </>
        )
      case 'text':
        return (
          <>
            <Text
              style={{
                color: colorContent,
                fontSize:
                  StyleConstants.Font.Size[size] * (size === 'M' ? 1 : 1.5),
                fontWeight: destructive
                  ? StyleConstants.Font.Weight.Bold
                  : undefined,
                opacity: loading ? 0 : 1
              }}
              children={content}
            />
            {loading && loadingSpinkit}
          </>
        )
    }
  }, [theme, content, loading, disabled])

  const colorBorder = useMemo(() => {
    if (disabled || loading) {
      return theme.secondary
    } else {
      if (destructive) {
        return theme.red
      } else {
        return theme.primary
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

  enum spacingMapping {
    XS = 'S',
    S = 'M',
    M = 'L',
    L = 'XL'
  }

  return (
    <Pressable
      {...(!disabled && !loading && { onPress })}
      children={children}
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
