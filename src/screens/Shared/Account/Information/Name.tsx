import { ParseEmojis } from '@components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { LinearGradient } from 'expo-linear-gradient'
import React, { forwardRef } from 'react'
import { StyleSheet } from 'react-native'
import ShimmerPlaceholder, {
  createShimmerPlaceholder
} from 'react-native-shimmer-placeholder'

export interface Props {
  account: Mastodon.Account | undefined
}

const AccountInformationName = forwardRef<ShimmerPlaceholder, Props>(
  ({ account }, ref) => {
    const { theme } = useTheme()
    const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)

    return (
      <ShimmerPlaceholder
        ref={ref}
        visible={
          account?.display_name !== undefined || account?.username !== undefined
        }
        width={StyleConstants.Font.Size.L * 8}
        height={StyleConstants.Font.Size.L}
        style={styles.name}
        shimmerColors={theme.shimmer}
      >
        {account ? (
          <ParseEmojis
            content={account.display_name || account.username}
            emojis={account.emojis}
            size='L'
            fontBold
          />
        ) : null}
      </ShimmerPlaceholder>
    )
  }
)

const styles = StyleSheet.create({
  name: {
    flexDirection: 'row',
    marginTop: StyleConstants.Spacing.M,
    marginBottom: StyleConstants.Spacing.XS
  }
})

export default AccountInformationName
