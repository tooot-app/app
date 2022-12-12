import Button from '@components/Button'
import GracefullyImage from '@components/GracefullyImage'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { Pressable, View } from 'react-native'

export interface Props {
  account: Mastodon.Account | undefined
  myInfo: boolean
  edit?: boolean
}

const AccountInformationAvatar: React.FC<Props> = ({ account, myInfo, edit }) => {
  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()
  return (
    <Pressable
      disabled={!myInfo}
      onPress={() => {
        myInfo && account && navigation.push('Tab-Shared-Account', { account })
      }}
      style={{
        borderRadius: 8,
        overflow: 'hidden',
        width: StyleConstants.Avatar.L,
        height: StyleConstants.Avatar.L
      }}
    >
      <GracefullyImage
        key={account?.avatar}
        style={{ flex: 1 }}
        uri={{ original: account?.avatar, static: account?.avatar_static }}
      />
      {edit ? (
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            alignContent: 'center',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Button type='icon' content='Edit' round onPress={() => {}} />
        </View>
      ) : null}
    </Pressable>
  )
}

export default AccountInformationAvatar
