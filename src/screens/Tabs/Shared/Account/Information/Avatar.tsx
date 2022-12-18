import GracefullyImage from '@components/GracefullyImage'
import navigationRef from '@helpers/navigationRef'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { getInstanceActive } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { Pressable } from 'react-native'
import { useSelector } from 'react-redux'

export interface Props {
  account: Mastodon.Account | undefined
  myInfo: boolean
}

const AccountInformationAvatar: React.FC<Props> = ({ account, myInfo }) => {
  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()
  useSelector(getInstanceActive)
  return (
    <Pressable
      onPress={() => {
        if (account) {
          if (myInfo) {
            navigation.push('Tab-Shared-Account', { account })
            return
          } else {
            navigationRef.navigate('Screen-ImagesViewer', {
              imageUrls: [{ id: 'avatar', url: account.avatar }],
              id: 'avatar',
              hideCounter: true
            })
          }
        }
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
    </Pressable>
  )
}

export default AccountInformationAvatar
