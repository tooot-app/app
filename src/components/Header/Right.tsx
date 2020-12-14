import { Feather } from '@expo/vector-icons'
import React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'

import { useTheme } from '@utils/styles/ThemeManager'
import { StyleConstants } from '@utils/styles/constants'

type PropsBase = {
  disabled?: boolean
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

const HeaderRight: React.FC<PropsText | PropsIcon> = ({
  disabled,
  onPress,
  text,
  icon
}) => {
  const { theme } = useTheme()

  return (
    <Pressable
      {...(!disabled && { onPress })}
      style={[
        styles.base,
        {
          backgroundColor: theme.backgroundGradientStart,
          ...(icon && { height: 44, width: 44, marginRight: -9 })
        }
      ]}
    >
      {text && (
        <Text
          style={[
            styles.text,
            { color: disabled ? theme.secondary : theme.primary }
          ]}
        >
          {text}
        </Text>
      )}
      {icon && (
        <Feather
          name={icon}
          color={disabled ? theme.secondary : theme.primary}
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

export default HeaderRight
