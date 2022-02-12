import { ParseEmojis } from '@components/Parse'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import analytics from './analytics'
import GracefullyImage from './GracefullyImage'

export interface Props {
  account: Mastodon.Account
  onPress?: () => void
  origin?: string
}

const ComponentAccount: React.FC<Props> = ({
  account,
  onPress: customOnPress,
  origin
}) => {
  const { colors } = useTheme()
  const navigation =
    useNavigation<StackNavigationProp<TabLocalStackParamList>>()

  const onPress = useCallback(() => {
    analytics('search_account_press', { page: origin })
    navigation.push('Tab-Shared-Account', { account })
  }, [])

  return (
    <Pressable
      accessibilityRole='button'
      style={[styles.itemDefault, styles.itemAccount]}
      onPress={customOnPress || onPress}
    >
      <GracefullyImage
        uri={{ original: account.avatar, static: account.avatar_static }}
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
          style={[styles.itemAccountAcct, { color: colors.secondary }]}
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
