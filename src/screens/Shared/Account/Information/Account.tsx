import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
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
        height={StyleConstants.Font.LineHeight.M}
        style={{ marginBottom: StyleConstants.Spacing.L }}
        shimmerColors={[
          theme.shimmerDefault,
          theme.shimmerHighlight,
          theme.shimmerDefault
        ]}
      >
        <View style={styles.account}>
          <Text
            style={{
              color: theme.secondary,
              ...StyleConstants.FontStyle.M
            }}
            selectable
          >
            @{account?.acct}
          </Text>
          {account?.locked ? (
            <Icon
              name='Lock'
              style={styles.type}
              color={theme.secondary}
              size={StyleConstants.Font.Size.M}
            />
          ) : null}
          {account?.bot ? (
            <Icon
              name='HardDrive'
              style={styles.type}
              color={theme.secondary}
              size={StyleConstants.Font.Size.M}
            />
          ) : null}
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

export default React.memo(
  AccountInformationAccount,
  (_, next) => next.account === undefined
)
