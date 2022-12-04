import React from 'react'
import { View } from 'react-native'
import { StyleConstants } from '@utils/styles/constants'

export interface Props {
  children: React.ReactNode
}

const MenuContainer: React.FC<Props> = ({ children }) => {
  return (
    <View
      style={{
        paddingHorizontal: StyleConstants.Spacing.Global.PagePadding,
        marginBottom: StyleConstants.Spacing.Global.PagePadding
      }}
    >
      {children}
    </View>
  )
}

export default MenuContainer
