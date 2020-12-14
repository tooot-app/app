import { Feather } from '@expo/vector-icons'
import React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'

import { useTheme } from '@utils/styles/ThemeManager'
import { StyleConstants } from '@utils/styles/constants'

type PropsBase = {
  onPress: () => void
}

export interface PropsText extends PropsBase {
  text: string
  icon?: any
}

export interface PropsIcon extends PropsBase {
  text?: string
  icon: any
}

const HeaderLeft: React.FC<PropsText | PropsIcon> = ({
  onPress,
  text,
  icon
}) => {
  const { theme } = useTheme()

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        {
          backgroundColor: theme.backgroundGradientStart,
          ...(icon && { height: 44, width: 44, marginLeft: -9 })
        }
      ]}
    >
      {text ? (
        <Text style={[styles.text, { color: theme.primary }]}>{text}</Text>
      ) : (
        <Feather
          name={icon || 'chevron-left'}
          color={theme.primary}
          size={StyleConstants.Spacing.L}
        />
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100
  },
  text: {
    fontSize: StyleConstants.Font.Size.M
  }
})

export default HeaderLeft
