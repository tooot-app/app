import analytics from '@components/analytics'
import GracefullyImage from '@components/GracefullyImage'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { StyleConstants } from '@utils/styles/constants'
import React, { useMemo } from 'react'
import { Pressable, StyleSheet } from 'react-native'

export interface Props {
  account: Mastodon.Account | undefined
  myInfo: boolean
}

const AccountInformationAvatar: React.FC<Props> = ({ account, myInfo }) => {
  const navigation = useNavigation<
    StackNavigationProp<Nav.LocalStackParamList>
  >()
  const dimension = useMemo(
    () => ({
      width: StyleConstants.Avatar.L,
      height: StyleConstants.Avatar.L
    }),
    []
  )

  return (
    <Pressable
      disabled={!myInfo}
      onPress={() => {
        analytics('account_avatar_press')
        myInfo &&
          account &&
          navigation.push('Screen-Shared-Account', { account })
      }}
    >
      <GracefullyImage
        style={styles.base}
        uri={{ original: account?.avatar || '' }}
        dimension={dimension}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: { borderRadius: 8, overflow: 'hidden' }
})

export default AccountInformationAvatar
