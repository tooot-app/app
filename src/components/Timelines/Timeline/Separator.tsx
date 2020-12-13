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
          borderTopColor: theme.separator,
          marginLeft: highlighted
            ? StyleConstants.Spacing.Global.PagePadding
            : StyleConstants.Spacing.Global.PagePadding +
              StyleConstants.Avatar.S +
              StyleConstants.Spacing.S
        }
      ]}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    borderTopWidth: 1,
    marginRight: StyleConstants.Spacing.Global.PagePadding
  }
})

export default TimelineSeparator
