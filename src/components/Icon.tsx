import React, { createElement } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import * as FeatherIcon from 'react-native-feather'

export interface Props {
  name: string
  size: number
  color: string
  fill?: string
  strokeWidth?: number
  inline?: boolean // When used in line of text, need to drag it down
  style?: StyleProp<ViewStyle>
}

const Icon: React.FC<Props> = ({
  name,
  size,
  color,
  fill,
  strokeWidth = 2,
  inline = false,
  style
}) => {
  return (
    <View
      style={[
        style,
        {
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: inline ? -size * 0.125 : undefined
        }
      ]}
    >
      {createElement(FeatherIcon[name], {
        width: size,
        height: size,
        color,
        fill,
        strokeWidth
      })}
    </View>
  )
}

export default Icon
