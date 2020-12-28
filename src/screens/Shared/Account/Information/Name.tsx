import Emojis from '@root/components/Timelines/Timeline/Shared/Emojis'
import { StyleConstants } from '@root/utils/styles/constants'
import { useTheme } from '@root/utils/styles/ThemeManager'
import { LinearGradient } from 'expo-linear-gradient'
import React, { forwardRef } from 'react'
import { StyleSheet, Text, View } from 'react-native'
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
        <View>
          {account?.emojis ? (
            <Emojis
              content={account?.display_name || account?.username}
              emojis={account.emojis}
              size='L'
              fontBold={true}
            />
          ) : (
            <Text
              style={{
                color: theme.primary,
                ...StyleConstants.FontStyle.L,
                fontWeight: StyleConstants.Font.Weight.Bold
              }}
            >
              {account?.display_name || account?.username}
            </Text>
          )}
        </View>
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
