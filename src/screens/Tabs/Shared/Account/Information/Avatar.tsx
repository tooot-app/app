import analytics from '@components/analytics'
import GracefullyImage from '@components/GracefullyImage'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { Pressable, StyleSheet } from 'react-native'

export interface Props {
  account: Mastodon.Account | undefined
  myInfo: boolean
}

const AccountInformationAvatar: React.FC<Props> = ({ account, myInfo }) => {
  const navigation = useNavigation<
    StackNavigationProp<Nav.TabLocalStackParamList>
  >()

  return (
    <Pressable
      disabled={!myInfo}
      onPress={() => {
        analytics('account_avatar_press')
        myInfo && account && navigation.push('Tab-Shared-Account', { account })
      }}
      style={styles.base}
    >
      <GracefullyImage
        key={account?.avatar}
        style={styles.image}
        uri={{ original: account?.avatar || '' }}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    overflow: 'hidden',
    width: StyleConstants.Avatar.L,
    height: StyleConstants.Avatar.L
  },
  image: { flex: 1 }
})

export default AccountInformationAvatar
