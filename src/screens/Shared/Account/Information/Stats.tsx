import { StyleConstants } from '@root/utils/styles/constants'
import { useTheme } from '@root/utils/styles/ThemeManager'
import { LinearGradient } from 'expo-linear-gradient'
import React, { createRef, forwardRef, useImperativeHandle } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import ShimmerPlaceholder, {
  createShimmerPlaceholder
} from 'react-native-shimmer-placeholder'

export interface Props {
  account: Mastodon.Account | undefined
}

const AccountInformationStats = forwardRef<any, Props>(({ account }, ref) => {
  const { theme } = useTheme()
  const { t } = useTranslation('sharedAccount')
  const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)

  const ref1 = createRef<ShimmerPlaceholder>()
  const ref2 = createRef<ShimmerPlaceholder>()
  const ref3 = createRef<ShimmerPlaceholder>()
  useImperativeHandle(ref, () => ({
    get ref1 () {
      return ref1.current
    },
    get ref2 () {
      return ref2.current
    },
    get ref3 () {
      return ref3.current
    }
  }))

  return (
    <View style={styles.stats}>
      <ShimmerPlaceholder
        ref={ref1}
        visible={account !== undefined}
        width={StyleConstants.Font.Size.S * 5}
        height={StyleConstants.Font.Size.S}
        shimmerColors={theme.shimmer}
      >
        <Text style={[styles.stat, { color: theme.primary }]}>
          {t('content.summary.statuses_count', {
            count: account?.statuses_count || 0
          })}
        </Text>
      </ShimmerPlaceholder>
      <ShimmerPlaceholder
        ref={ref2}
        visible={account !== undefined}
        width={StyleConstants.Font.Size.S * 5}
        height={StyleConstants.Font.Size.S}
        shimmerColors={theme.shimmer}
      >
        <Text
          style={[styles.stat, { color: theme.primary, textAlign: 'center' }]}
        >
          {t('content.summary.followers_count', {
            count: account?.followers_count || 0
          })}
        </Text>
      </ShimmerPlaceholder>
      <ShimmerPlaceholder
        ref={ref3}
        visible={account !== undefined}
        width={StyleConstants.Font.Size.S * 5}
        height={StyleConstants.Font.Size.S}
        shimmerColors={theme.shimmer}
      >
        <Text
          style={[styles.stat, { color: theme.primary, textAlign: 'right' }]}
        >
          {t('content.summary.following_count', {
            count: account?.following_count || 0
          })}
        </Text>
      </ShimmerPlaceholder>
    </View>
  )
})

const styles = StyleSheet.create({
  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  stat: {
    ...StyleConstants.FontStyle.S
  }
})

export default AccountInformationStats
