import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { StyleSheet, Text, View, ViewStyle } from 'react-native'
import { PlaceholderLine } from 'rn-placeholder'

export interface Props {
  style?: ViewStyle
  header: string
  content?: string
  potentialWidth?: number
}

const InstanceInfo = React.memo(
  ({ style, header, content, potentialWidth }: Props) => {
    const { theme } = useTheme()

    return (
      <View style={[styles.base, style]}>
        <Text style={[styles.header, { color: theme.primaryDefault }]}>{header}</Text>
        {content ? (
          <Text style={[styles.content, { color: theme.primaryDefault }]}>
            {content}
          </Text>
        ) : (
          <PlaceholderLine
            width={
              potentialWidth
                ? potentialWidth * StyleConstants.Font.Size.M
                : undefined
            }
            height={StyleConstants.Font.LineHeight.M}
            color={theme.shimmerDefault}
            noMargin
            style={{ borderRadius: 0 }}
          />
        )}
      </View>
    )
  },
  (prev, next) => prev.content === next.content
)

const styles = StyleSheet.create({
  base: {
    flex: 1,
    marginTop: StyleConstants.Spacing.M,
    paddingLeft: StyleConstants.Spacing.Global.PagePadding,
    paddingRight: StyleConstants.Spacing.Global.PagePadding
  },
  header: {
    ...StyleConstants.FontStyle.S,
    fontWeight: StyleConstants.Font.Weight.Bold,
    marginBottom: StyleConstants.Spacing.XS
  },
  content: {
    ...StyleConstants.FontStyle.M
  }
})

export default InstanceInfo
