import GracefullyImage from '@components/GracefullyImage'
import navigationRef from '@utils/navigation/navigationRef'
import React, { useContext } from 'react'
import { Dimensions, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AccountContext from './Context'

const AccountHeader: React.FC = () => {
  const { account } = useContext(AccountContext)

  const topInset = useSafeAreaInsets().top
  const height = Dimensions.get('window').width / 3 + topInset

  return (
    <GracefullyImage
      sources={{ default: { uri: account?.header }, static: { uri: account?.header_static } }}
      style={{ height }}
      onPress={() => {
        if (account) {
          Image.getSize(account.header, (width, height) =>
            navigationRef.navigate('Screen-ImagesViewer', {
              imageUrls: [{ id: 'avatar', url: account.header, width, height }],
              id: 'avatar',
              hideCounter: true
            })
          )
        }
      }}
      dim
    />
  )
}

export default AccountHeader
