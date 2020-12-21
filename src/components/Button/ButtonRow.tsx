import { Feather } from '@expo/vector-icons'
import React from 'react'
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'

type PropsBase = {
  onPress: () => void
  disabled?: boolean
  buttonSize?: 'S' | 'M'
  size?: 'S' | 'M' | 'L'
  style?: StyleProp<ViewStyle>
}

export interface PropsText extends PropsBase {
  text: string
  icon?: any
}

export interface PropsIcon extends PropsBase {
  text?: string
  icon: any
}

const ButtonRow: React.FC<PropsText | PropsIcon> = ({
  onPress,
  disabled = false,
  buttonSize = 'M',
  text,
  icon,
  size = 'M',
  style: customStyle
}) => {
  const { theme } = useTheme()

  return (
    <Pressable
      {...(!disabled && { onPress })}
      style={[
        customStyle,
        styles.button,
        {
          paddingLeft:
            StyleConstants.Spacing.M -
            (icon ? StyleConstants.Font.Size[size] / 2 : 0),
          paddingRight:
            StyleConstants.Spacing.M -
            (icon ? StyleConstants.Font.Size[size] / 2 : 0),
          borderColor: disabled ? theme.secondary : theme.primary,
          paddingTop: StyleConstants.Spacing[buttonSize === 'M' ? 'S' : 'XS'],
          paddingBottom: StyleConstants.Spacing[buttonSize === 'M' ? 'S' : 'XS']
        }
      ]}
    >
      {icon ? (
        <Feather
          name={icon}
          size={StyleConstants.Font.Size[size]}
          color={disabled ? theme.secondary : theme.primary}
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: disabled ? theme.secondary : theme.primary,
              fontSize: StyleConstants.Font.Size[size]
            }
          ]}
        >
          {text}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.25,
    borderRadius: 100,
    alignItems: 'center'
  },
  text: {
    textAlign: 'center'
  }
})

export default ButtonRow
