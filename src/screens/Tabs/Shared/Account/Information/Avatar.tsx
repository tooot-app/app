import GracefullyImage from '@components/GracefullyImage'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import navigationRef from '@utils/navigation/navigationRef'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { StyleConstants } from '@utils/styles/constants'
import React, { useContext } from 'react'
import AccountContext from '../Context'

const AccountInformationAvatar: React.FC = () => {
  const { account, pageMe } = useContext(AccountContext)

  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()

  return (
    <GracefullyImage
      style={{ borderRadius: StyleConstants.BorderRadius, overflow: 'hidden' }}
      dimension={{ width: StyleConstants.Avatar.L, height: StyleConstants.Avatar.L }}
      sources={{
        default: { uri: account?.avatar },
        static: { uri: account?.avatar_static }
      }}
      onPress={() => {
        if (account) {
          if (pageMe) {
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
      dim
      withoutTransition
    />
  )
}

export default AccountInformationAvatar
