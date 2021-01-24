import analytics from '@components/analytics'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { StyleConstants } from '@root/utils/styles/constants'
import { useTheme } from '@root/utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { PlaceholderLine } from 'rn-placeholder'

export interface Props {
  account: Mastodon.Account | undefined
  myInfo: boolean
}

const AccountInformationStats: React.FC<Props> = ({ account, myInfo }) => {
  const navigation = useNavigation<
    StackNavigationProp<Nav.LocalStackParamList>
  >()
  const { theme } = useTheme()
  const { t } = useTranslation('sharedAccount')

  return (
    <View style={[styles.stats, { flexDirection: 'row' }]}>
      {account ? (
        <Text
          style={[styles.stat, { color: theme.primary }]}
          children={t('content.summary.statuses_count', {
            count: account?.statuses_count || 0
          })}
          onPress={() => {
            analytics('account_stats_toots_press', {
              count: account.statuses_count
            })
            myInfo && navigation.push('Screen-Shared-Account', { account })
          }}
        />
      ) : (
        <PlaceholderLine
          width={StyleConstants.Font.Size.S * 1.25}
          height={StyleConstants.Font.LineHeight.S}
          color={theme.shimmerDefault}
          noMargin
          style={{ borderRadius: 0 }}
        />
      )}
      {account ? (
        <Text
          style={[styles.stat, { color: theme.primary, textAlign: 'right' }]}
          children={t('content.summary.following_count', {
            count: account?.following_count || 0
          })}
          onPress={() => {
            analytics('account_stats_following_press', {
              count: account.following_count
            })
            navigation.push('Screen-Shared-Relationships', {
              account,
              initialType: 'following'
            })
          }}
        />
      ) : (
        <PlaceholderLine
          width={StyleConstants.Font.Size.S * 1.25}
          height={StyleConstants.Font.LineHeight.S}
          color={theme.shimmerDefault}
          noMargin
          style={{ borderRadius: 0 }}
        />
      )}
      {account ? (
        <Text
          style={[styles.stat, { color: theme.primary, textAlign: 'center' }]}
          children={t('content.summary.followers_count', {
            count: account?.followers_count || 0
          })}
          onPress={() => {
            analytics('account_stats_followers_press', {
              count: account.followers_count
            })
            navigation.push('Screen-Shared-Relationships', {
              account,
              initialType: 'followers'
            })
          }}
        />
      ) : (
        <PlaceholderLine
          width={StyleConstants.Font.Size.S * 1.25}
          height={StyleConstants.Font.LineHeight.S}
          color={theme.shimmerDefault}
          noMargin
          style={{ borderRadius: 0 }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  stats: {
    flex: 1,
    justifyContent: 'space-between'
  },
  stat: {
    ...StyleConstants.FontStyle.S
  }
})

export default AccountInformationStats
