import { Feather } from '@expo/vector-icons'
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

const AccountInformationAccount = forwardRef<ShimmerPlaceholder, Props>(
  ({ account }, ref) => {
    const { theme } = useTheme()

    const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)

    return (
      <ShimmerPlaceholder
        ref={ref}
        visible={account?.acct !== undefined}
        width={StyleConstants.Font.Size.M * 8}
        height={StyleConstants.Font.Size.M}
        style={{ marginBottom: StyleConstants.Spacing.L }}
        shimmerColors={theme.shimmer}
      >
        <View style={styles.account}>
          <Text
            style={{
              color: theme.secondary,
              fontSize: StyleConstants.Font.Size.M
            }}
            selectable
          >
            @{account?.acct}
          </Text>
          {account?.locked && (
            <Feather name='lock' style={styles.type} color={theme.secondary} />
          )}
          {account?.bot && (
            <Feather
              name='hard-drive'
              style={styles.type}
              color={theme.secondary}
            />
          )}
        </View>
      </ShimmerPlaceholder>
    )
  }
)

const styles = StyleSheet.create({
  account: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  type: { marginLeft: StyleConstants.Spacing.S }
})

export default AccountInformationAccount
