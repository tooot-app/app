import React from 'react'
import { StyleSheet, View } from 'react-native'

import constants from 'src/utils/styles/constants'
import { useTheme } from 'src/utils/styles/ThemeManager'

const TimelineSeparator = () => {
  const { theme } = useTheme()

  return <View style={[styles.base, { borderTopColor: theme.separator }]} />
}

const styles = StyleSheet.create({
  base: {
    borderTopWidth: 1,
    marginLeft: constants.SPACING_M + constants.AVATAR_S + constants.SPACING_S
  }
})

export default TimelineSeparator
