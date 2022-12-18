import GracefullyImage from '@components/GracefullyImage'
import navigationRef from '@helpers/navigationRef'
import { getInstanceActive } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Dimensions, Image, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'

export interface Props {
  account?: Mastodon.Account
}

const AccountHeader: React.FC<Props> = ({ account }) => {
  const { colors } = useTheme()
  const topInset = useSafeAreaInsets().top

  useSelector(getInstanceActive)

  return (
    <Pressable
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
    >
      <GracefullyImage
        uri={{ original: account?.header, static: account?.header_static }}
        style={{
          height: Dimensions.get('screen').width / 3 + topInset,
          backgroundColor: colors.disabled
        }}
      />
    </Pressable>
  )
}

export default AccountHeader
