import React from 'react'
import { StyleSheet, View } from 'react-native'
import { StyleConstants } from '@utils/styles/constants'

export interface Props {
  children: React.ReactNode
}


const MenuContainer: React.FC<Props> = ({ children }) => {
  return <View hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.base}>{children}</View>
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: StyleConstants.Spacing.Global.PagePadding,
    marginBottom: StyleConstants.Spacing.Global.PagePadding
  }
})

export default MenuContainer
