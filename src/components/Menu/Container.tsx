import React from 'react'
import { StyleSheet, View } from 'react-native'
import { StyleConstants } from '@utils/styles/constants'

export interface Props {
  children: React.ReactNode
}

const MenuContainer: React.FC<Props> = ({ children }) => {
  return (
    <View style={styles.base}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    marginBottom: StyleConstants.Spacing.L
  }
})

export default MenuContainer
