import { ParseEmojis } from '@root/components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export interface Props {
  account: Mastodon.Account
}

const HeaderSharedAccount: React.FC<Props> = ({ account }) => {
  const { theme } = useTheme()

  return (
    <View style={styles.base}>
      <Text numberOfLines={1}>
        <ParseEmojis
          content={account.display_name || account.username}
          emojis={account.emojis}
          fontBold
        />
      </Text>
      <Text style={[styles.acct, { color: theme.secondary }]} numberOfLines={1}>
        @{account.acct}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  acct: {
    flexShrink: 1,
    marginLeft: StyleConstants.Spacing.XS
  }
})

export default HeaderSharedAccount
