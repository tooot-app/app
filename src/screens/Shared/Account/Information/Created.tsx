import { Feather } from '@expo/vector-icons'
import { StyleConstants } from '@root/utils/styles/constants'
import { useTheme } from '@root/utils/styles/ThemeManager'
import { LinearGradient } from 'expo-linear-gradient'
import React, { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import ShimmerPlaceholder, {
  createShimmerPlaceholder
} from 'react-native-shimmer-placeholder'

export interface Props {
  account: Mastodon.Account | undefined
}

const AccountInformationCreated = forwardRef<ShimmerPlaceholder, Props>(
  ({ account }, ref) => {
    const { theme } = useTheme()
    const { t } = useTranslation('sharedAccount')
    const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)

    return (
      <ShimmerPlaceholder
        ref={ref}
        visible={account?.created_at !== undefined}
        width={StyleConstants.Font.Size.S * 8}
        height={StyleConstants.Font.Size.S}
        style={{ marginBottom: StyleConstants.Spacing.M }}
        shimmerColors={theme.shimmer}
      >
        <View style={styles.created}>
          <Feather
            name='calendar'
            size={StyleConstants.Font.Size.S}
            color={theme.secondary}
            style={styles.icon}
          />
          <Text
            style={{
              color: theme.secondary,
              fontSize: StyleConstants.Font.Size.S
            }}
          >
            {t('content.created_at', {
              date: new Date(account?.created_at!).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            })}
          </Text>
        </View>
      </ShimmerPlaceholder>
    )
  }
)

const styles = StyleSheet.create({
  created: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    marginRight: StyleConstants.Spacing.XS
  }
})

export default AccountInformationCreated
