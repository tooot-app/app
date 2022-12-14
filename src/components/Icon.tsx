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
  crossOut?: boolean
}

const Icon: React.FC<Props> = ({
  accessibilityLabel,
  name,
  size,
  color,
  fill,
  strokeWidth = 2,
  style,
  crossOut = false
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
      {crossOut ? (
        <View
          style={{
            position: 'absolute',
            transform: [{ rotate: '45deg' }],
            width: size * 1.35,
            borderBottomColor: color,
            borderBottomWidth: strokeWidth
          }}
        />
      ) : null}
    </View>
  )
}

export default Icon
