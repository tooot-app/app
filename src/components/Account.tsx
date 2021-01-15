import { ParseEmojis } from '@components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import GracefullyImage from './GracefullyImage'

export interface Props {
  account: Mastodon.Account
  onPress: () => void
}

const ComponentAccount: React.FC<Props> = ({ account, onPress }) => {
  const { theme } = useTheme()

  return (
    <Pressable
      style={[styles.itemDefault, styles.itemAccount]}
      onPress={onPress}
    >
      <GracefullyImage
        uri={{ original: account.avatar_static }}
        style={styles.itemAccountAvatar}
      />
      <View>
        <Text numberOfLines={1}>
          <ParseEmojis
            content={account.display_name || account.username}
            emojis={account.emojis}
            size='S'
            fontBold
          />
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.itemAccountAcct, { color: theme.secondary }]}
        >
          @{account.acct}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  itemDefault: {
    paddingHorizontal: StyleConstants.Spacing.Global.PagePadding,
    paddingVertical: StyleConstants.Spacing.M
  },
  itemAccount: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemAccountAvatar: {
    alignSelf: 'flex-start',
    width: StyleConstants.Avatar.S,
    height: StyleConstants.Avatar.S,
    borderRadius: 6,
    marginRight: StyleConstants.Spacing.S
  },
  itemAccountAcct: { marginTop: StyleConstants.Spacing.XS }
})

export default ComponentAccount
