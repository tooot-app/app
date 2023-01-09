import GracefullyImage from '@components/GracefullyImage'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import navigationRef from '@utils/navigation/navigationRef'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { useGlobalStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import React, { useContext } from 'react'
import AccountContext from '../Context'

const AccountInformationAvatar: React.FC = () => {
  const { account, pageMe } = useContext(AccountContext)

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
    />
  )
}

export default AccountInformationAvatar
