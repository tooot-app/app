import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { StyleConstants } from 'src/utils/styles/constants'
import { useTheme } from 'src/utils/styles/ThemeManager'

export interface Props {
  heading: string
}

const MenuHeader: React.FC<Props> = ({ heading }) => {
  const { theme } = useTheme()

  return (
    <View style={[styles.base, { borderBottomColor: theme.separator }]}>
      <Text>{heading}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderBottomWidth: 1,
    paddingLeft: StyleConstants.Spacing.Global.PagePadding,
    paddingRight: StyleConstants.Spacing.Global.PagePadding,
    paddingBottom: StyleConstants.Spacing.S
  }
})

export default MenuHeader
