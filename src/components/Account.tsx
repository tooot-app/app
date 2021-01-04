import { ParseEmojis } from '@components/Parse'
import { useNavigation } from '@react-navigation/native'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

export interface Props {
  account: Mastodon.Account
}

const ComponentAccount: React.FC<Props> = ({ account }) => {
  const navigation = useNavigation()
  const { theme } = useTheme()

  return (
    <Pressable
      style={[styles.itemDefault, styles.itemAccount]}
      onPress={() => {
        navigation.push('Screen-Shared-Account', { account })
      }}
    >
      <Image
        source={{ uri: account.avatar_static }}
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
