import CustomText from '@components/Text'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { PlaceholderLine } from 'rn-placeholder'
import AccountContext from '../Context'

const AccountInformationStats: React.FC = () => {
  const { account, pageMe } = useContext(AccountContext)

  if (account?.suspended) {
    return null
  }

  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()
  const { colors } = useTheme()
  const { t } = useTranslation('screenTabs')

  return (
    <View style={[styles.stats, { flexDirection: 'row' }]}>
      {account ? (
        <CustomText
          style={[styles.stat, { color: colors.primaryDefault }]}
          children={t('shared.account.summary.statuses_count', {
            count: account.statuses_count || 0
          })}
          onPress={() => {
            pageMe && account && navigation.push('Tab-Shared-Account', { account })
          }}
        />
      ) : (
        <PlaceholderLine
          width={StyleConstants.Font.Size.S * 1.25}
          height={StyleConstants.Font.LineHeight.S}
          color={colors.shimmerDefault}
          noMargin
          style={{ borderRadius: 0 }}
        />
      )}
      {account ? (
        <CustomText
          style={[styles.stat, { color: colors.primaryDefault, textAlign: 'right' }]}
          children={t('shared.users.accounts.following', {
            count: account.following_count
          })}
          onPress={() =>
            navigation.push('Tab-Shared-Users', {
              reference: 'accounts',
              account,
              type: 'following',
              count: account.following_count
            })
          }
        />
      ) : (
        <PlaceholderLine
          width={StyleConstants.Font.Size.S * 1.25}
          height={StyleConstants.Font.LineHeight.S}
          color={colors.shimmerDefault}
          noMargin
          style={{ borderRadius: 0 }}
        />
      )}
      {account ? (
        <CustomText
          style={[styles.stat, { color: colors.primaryDefault, textAlign: 'center' }]}
          children={t('shared.users.accounts.followers', {
            count: account.followers_count
          })}
          onPress={() =>
            navigation.push('Tab-Shared-Users', {
              reference: 'accounts',
              account,
              type: 'followers',
              count: account.followers_count
            })
          }
        />
      ) : (
        <PlaceholderLine
          width={StyleConstants.Font.Size.S * 1.25}
          height={StyleConstants.Font.LineHeight.S}
          color={colors.shimmerDefault}
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
