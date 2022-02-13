import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'

export interface Props {
  heading: string
}

const MenuHeader: React.FC<Props> = ({ heading }) => {
  const { colors } = useTheme()

  return (
    <View style={styles.base}>
      <Text style={[styles.text, { color: colors.secondary }]}>{heading}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingBottom: StyleConstants.Spacing.S
  },
  text: {
    ...StyleConstants.FontStyle.S,
    fontWeight: StyleConstants.Font.Weight.Bold
  }
})

export default MenuHeader
