import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'

export interface Props {
  heading: string
}

const MenuHeader: React.FC<Props> = ({ heading }) => {
  const { theme } = useTheme()

  return (
    <View style={[styles.base, { borderBottomColor: theme.separator }]}>
      <Text style={[styles.text, { color: theme.primary }]}>{heading}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderBottomWidth: 1,
    paddingLeft: StyleConstants.Spacing.Global.PagePadding,
    paddingRight: StyleConstants.Spacing.Global.PagePadding,
    paddingBottom: StyleConstants.Spacing.S
  },
  text: {
    fontSize: StyleConstants.Font.Size.S
  }
})

export default MenuHeader
