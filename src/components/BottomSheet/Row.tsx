import React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'

import { useTheme } from 'src/utils/styles/ThemeManager'
import { StyleConstants } from 'src/utils/styles/constants'

export interface Props {
  onPress: () => void
  icon: string
  text: string
}

const BottomSheetRow: React.FC<Props> = ({ onPress, icon, text }) => {
  const { theme } = useTheme()

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <Feather
        name={icon}
        color={theme.primary}
        size={StyleConstants.Font.Size.L}
      />
      <Text style={[styles.text, { color: theme.primary }]}>{text}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: StyleConstants.Spacing.L
  },
  text: {
    fontSize: StyleConstants.Font.Size.M,
    lineHeight: StyleConstants.Font.Size.L,
    marginLeft: StyleConstants.Spacing.S
  }
})

export default BottomSheetRow
