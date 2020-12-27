import { StyleConstants } from '@root/utils/styles/constants'
import { useTheme } from '@root/utils/styles/ThemeManager'
import { LinearGradient } from 'expo-linear-gradient'
import React, { forwardRef, useState } from 'react'
import { Image, StyleSheet } from 'react-native'
import ShimmerPlaceholder, {
  createShimmerPlaceholder
} from 'react-native-shimmer-placeholder'

export interface Props {
  account: Mastodon.Account | undefined
}

const AccountInformationAvatar = forwardRef<ShimmerPlaceholder, Props>(
  ({ account }, ref) => {
    const { theme } = useTheme()
    const [avatarLoaded, setAvatarLoaded] = useState(false)

    const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)

    return (
      <ShimmerPlaceholder
        ref={ref}
        visible={avatarLoaded}
        width={StyleConstants.Avatar.L}
        height={StyleConstants.Avatar.L}
        shimmerColors={theme.shimmer}
      >
        <Image
          source={{ uri: account?.avatar }}
          style={styles.avatar}
          onLoadEnd={() => setAvatarLoaded(true)}
        />
      </ShimmerPlaceholder>
    )
  }
)

const styles = StyleSheet.create({
  avatar: {
    width: StyleConstants.Avatar.L,
    height: StyleConstants.Avatar.L,
    borderRadius: 8
  }
})

export default AccountInformationAvatar
