import GracefullyImage from '@components/GracefullyImage'
import navigationRef from '@helpers/navigationRef'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { useGlobalStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'

export interface Props {
  account: Mastodon.Account | undefined
  myInfo: boolean
}

const AccountInformationAvatar: React.FC<Props> = ({ account, myInfo }) => {
  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()

  useGlobalStorage.string('account.active')

  return (
    <GracefullyImage
      key={account?.avatar}
      style={{
        borderRadius: 8,
        overflow: 'hidden',
        width: StyleConstants.Avatar.L,
        height: StyleConstants.Avatar.L
      }}
      uri={{ original: account?.avatar, static: account?.avatar_static }}
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
    />
  )
}

export default AccountInformationAvatar
