import React, { createElement } from 'react'
import { AccessibilityProps, StyleProp, View, ViewStyle } from 'react-native'
import * as FeatherIcon from 'react-native-feather'

export interface Props {
  accessibilityLabel?: AccessibilityProps['accessibilityLabel']

  name: string
  size: number
  color: string
  fill?: string
  strokeWidth?: number
  style?: StyleProp<ViewStyle>
}

const Icon: React.FC<Props> = ({
  accessibilityLabel,
  name,
  size,
  color,
  fill,
  strokeWidth = 2,
  style
}) => {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        style,
        {
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center'
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
