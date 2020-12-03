import React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import { StyleConstants } from 'src/utils/styles/constants'
import { useTheme } from 'src/utils/styles/ThemeManager'

export interface Props {
  onPress: () => void
  text: string
  fontSize?: 'S' | 'M' | 'L'
}

const Button: React.FC<Props> = ({ onPress, text, fontSize = 'M' }) => {
  const { theme } = useTheme()

  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, { borderColor: theme.primary }]}
    >
      <Text
        style={[
          styles.text,
          { color: theme.primary, fontSize: StyleConstants.Font.Size[fontSize] }
        ]}
      >
        {text}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingTop: StyleConstants.Spacing.S,
    paddingBottom: StyleConstants.Spacing.S,
    paddingLeft: StyleConstants.Spacing.M,
    paddingRight: StyleConstants.Spacing.M,
    borderWidth: 1,
    borderRadius: 100
  },
  text: {
    textAlign: 'center'
  }
})

export default Button
