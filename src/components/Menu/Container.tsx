import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { View, ViewStyle } from 'react-native'

export interface Props {
  style?: ViewStyle
  children: React.ReactNode
}

const MenuContainer: React.FC<Props> = ({ style, children }) => {
  return (
    <View
      style={{
        paddingHorizontal: StyleConstants.Spacing.Global.PagePadding,
        marginBottom: StyleConstants.Spacing.Global.PagePadding,
        ...style
      }}
    >
      {children}
    </View>
  )
}

export default MenuContainer
