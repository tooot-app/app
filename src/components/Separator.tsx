import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { StyleSheet, View } from 'react-native'

export interface Props {
  extraMarginLeft?: number
  extraMarginRight?: number
}

const ComponentSeparator = React.memo(
  ({ extraMarginLeft = 0, extraMarginRight = 0 }: Props) => {
    const { theme } = useTheme()

    return (
      <View
        style={{
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          marginLeft:
            StyleConstants.Spacing.Global.PagePadding + extraMarginLeft,
          marginRight:
            StyleConstants.Spacing.Global.PagePadding + extraMarginRight
        }}
      />
    )
  },
  () => true
)

export default ComponentSeparator
