import { ParseEmojis } from '@root/components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

export interface Props {
  account: Mastodon.Account
  withoutName?: boolean // For notification follow request etc.
}

const HeaderSharedAccount = React.memo(
  ({ account, withoutName = false }: Props) => {
    const { t } = useTranslation('componentTimeline')
    const { colors } = useTheme()

    return (
      <View style={styles.base}>
        {withoutName ? null : (
          <Text
            accessibilityHint={t(
              'shared.header.shared.account.name.accessibilityHint'
            )}
            style={styles.name}
            numberOfLines={1}
          >
            <ParseEmojis
              content={account?.display_name || account.username}
              emojis={account.emojis}
              fontBold
            />
          </Text>
        )}
        <Text
          accessibilityHint={t(
            'shared.header.shared.account.account.accessibilityHint'
          )}
          style={[styles.acct, { color: colors.secondary }]}
          numberOfLines={1}
        >
          @{account.acct}
        </Text>
      </View>
    )
  },
  () => true
)

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  name: {
    marginRight: StyleConstants.Spacing.XS
  },
  acct: {
    flexShrink: 1
  }
})

export default HeaderSharedAccount
