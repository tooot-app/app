import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'src/utils/styles/ThemeManager'

import constants from 'src/utils/styles/constants'

const MenuContainer: React.FC = ({ ...props }) => {
  const { theme } = useTheme()

  return (
    <View style={[styles.base, { borderTopColor: theme.separator }]}>
      {props.children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderTopWidth: 1,
    marginBottom: constants.SPACING_M
  }
})

export default MenuContainer
