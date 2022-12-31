import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'

export interface Props {
  extraMarginLeft?: number
  extraMarginRight?: number
  style?: StyleProp<ViewStyle>
}

const ComponentSeparator: React.FC<Props> = ({
  extraMarginLeft = 0,
  extraMarginRight = 0,
  style
}) => {
  const { colors } = useTheme()

  return (
    <View
      style={[
        style,
        {
          backgroundColor: colors.backgroundDefault,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          marginLeft: StyleConstants.Spacing.Global.PagePadding + extraMarginLeft,
          marginRight: StyleConstants.Spacing.Global.PagePadding + extraMarginRight
        }
      ]}
    />
  )
}

export default ComponentSeparator
