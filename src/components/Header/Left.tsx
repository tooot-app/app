import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useMemo } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'

export interface Props {
  type?: 'icon' | 'text'
  content?: string
  native?: boolean
  background?: boolean

  onPress: () => void
}

const HeaderLeft: React.FC<Props> = ({
  type = 'icon',
  content,
  native = true,
  background = false,
  onPress
}) => {
  const { colors, theme } = useTheme()

  const children = useMemo(() => {
    switch (type) {
      case 'icon':
        return (
          <Icon
            color={colors.primaryDefault}
            name={content || 'ChevronLeft'}
            size={StyleConstants.Spacing.M * 1.25}
          />
        )
      case 'text':
        return (
          <Text
            style={[styles.text, { color: colors.primaryDefault }]}
            children={content}
          />
        )
    }
  }, [theme])

  return (
    <Pressable
      onPress={onPress}
      children={children}
      style={[
        styles.base,
        {
          backgroundColor: background
            ? colors.backgroundOverlayDefault
            : undefined,
          minHeight: 44,
          minWidth: 44,
          marginLeft: native
            ? -StyleConstants.Spacing.S
            : StyleConstants.Spacing.S,
          ...(type === 'icon' && {
            borderRadius: 100
          }),
          ...(type === 'text' && {
            paddingHorizontal: StyleConstants.Spacing.S
          })
        }
      ]}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    ...StyleConstants.FontStyle.M
  }
})

export default HeaderLeft
