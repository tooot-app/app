import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'src/utils/styles/ThemeManager'

import constants from 'src/utils/styles/constants'

export interface Props {
  children: React.ReactNode
  marginTop?: boolean
}

const MenuContainer: React.FC<Props> = ({ ...props }) => {
  const { theme } = useTheme()

  return (
    <View
      style={[
        styles.base,
        {
          borderTopColor: theme.separator,
          marginTop: props.marginTop ? constants.GLOBAL_PAGE_PADDING : 0
        }
      ]}
    >
      {props.children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderTopWidth: 1,
    marginBottom: constants.GLOBAL_PAGE_PADDING
  }
})

export default MenuContainer
