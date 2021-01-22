import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
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
    const { i18n } = useTranslation()
    const { theme } = useTheme()
    const { t } = useTranslation('sharedAccount')
    const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)

    return (
      <ShimmerPlaceholder
        ref={ref}
        visible={account?.created_at !== undefined}
        width={StyleConstants.Font.Size.S * 8}
        height={StyleConstants.Font.LineHeight.S}
        style={{ marginBottom: StyleConstants.Spacing.M }}
        shimmerColors={[
          theme.shimmerDefault,
          theme.shimmerHighlight,
          theme.shimmerDefault
        ]}
      >
        <View style={styles.created}>
          <Icon
            name='Calendar'
            size={StyleConstants.Font.Size.S}
            color={theme.secondary}
            style={styles.icon}
          />
          <Text
            style={{
              color: theme.secondary,
              ...StyleConstants.FontStyle.S
            }}
          >
            {t('content.created_at', {
              date: new Date(account?.created_at || '').toLocaleDateString(
                i18n.language,
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }
              )
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
