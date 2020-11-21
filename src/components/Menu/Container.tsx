import React from 'react'
import { View } from 'react-native'

const MenuContainer: React.FC = ({ ...props }) => {
  return <View>{props.children}</View>
}

export default MenuContainer
