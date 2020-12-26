import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useTheme } from '@utils/styles/ThemeManager'
import { StyleConstants } from '@utils/styles/constants'

export interface Props {
  highlighted?: boolean
}

const TimelineSeparator: React.FC<Props> = ({ highlighted = false }) => {
  const { theme } = useTheme()

  return (
    <View
      style={[
        styles.base,
        {
          borderTopColor: theme.border,
          marginLeft: highlighted
            ? StyleConstants.Spacing.Global.PagePadding
            : StyleConstants.Spacing.Global.PagePadding +
              StyleConstants.Avatar.M +
              StyleConstants.Spacing.S
        }
      ]}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginRight: StyleConstants.Spacing.Global.PagePadding
  }
})

export default TimelineSeparator
