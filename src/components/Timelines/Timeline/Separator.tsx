import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useTheme } from 'src/utils/styles/ThemeManager'
import { StyleConstants } from 'src/utils/styles/constants'

const TimelineSeparator = () => {
  const { theme } = useTheme()

  return <View style={[styles.base, { borderTopColor: theme.separator }]} />
}

const styles = StyleSheet.create({
  base: {
    borderTopWidth: 1,
    marginLeft:
      StyleConstants.Spacing.M +
      StyleConstants.Avatar.S +
      StyleConstants.Spacing.S,
    marginRight: StyleConstants.Spacing.M
  }
})

export default TimelineSeparator
