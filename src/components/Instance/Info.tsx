import { ParseHTML } from '@components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Dimensions, StyleSheet, Text, View, ViewStyle } from 'react-native'
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'

export interface Props {
  style?: ViewStyle
  visible: boolean
  header: string
  content?: string
  potentialWidth?: number
  potentialLines?: number
}

const InstanceInfo = React.memo(
  ({
    style,
    visible,
    header,
    content,
    potentialWidth,
    potentialLines = 1
  }: Props) => {
    const { theme } = useTheme()
    const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)

    return (
      <View style={[styles.base, style]}>
        <Text style={[styles.header, { color: theme.primary }]}>{header}</Text>
        <ShimmerPlaceholder
          visible={visible}
          stopAutoRun
          width={
            potentialWidth
              ? potentialWidth * StyleConstants.Font.Size.M
              : Dimensions.get('screen').width -
                StyleConstants.Spacing.Global.PagePadding * 4
          }
          height={StyleConstants.Font.LineHeight.M * potentialLines}
          shimmerColors={[theme.shimmerDefault, theme.shimmerHighlight, theme.shimmerDefault]}
        >
          {content ? (
            <ParseHTML
              content={content}
              size={'M'}
              numberOfLines={5}
              expandHint='介绍'
            />
          ) : null}
        </ShimmerPlaceholder>
      </View>
    )
  }
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
  }
})

export default InstanceInfo
