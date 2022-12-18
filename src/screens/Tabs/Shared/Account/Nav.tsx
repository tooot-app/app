import { ParseEmojis } from '@components/Parse'
import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface Props {
  scrollY: Animated.SharedValue<number>
  account: Mastodon.Account | undefined
}

const AccountNav = React.memo(
  ({ scrollY, account }: Props) => {
    const { colors } = useTheme()
    const headerHeight = useSafeAreaInsets().top + 44

    const nameY =
      Dimensions.get('window').width / 3 +
      StyleConstants.Avatar.L -
      StyleConstants.Spacing.Global.PagePadding * 2 +
      StyleConstants.Spacing.M -
      headerHeight

    const styleOpacity = useAnimatedStyle(() => {
      return {
        opacity: interpolate(scrollY.value, [0, 200], [0, 1], Extrapolate.CLAMP)
      }
    })
    const styleMarginTop = useAnimatedStyle(() => {
      return {
        marginTop: interpolate(scrollY.value, [nameY, nameY + 20], [50, 0], Extrapolate.CLAMP)
      }
    })

    return (
      <Animated.View
        style={[
          styleOpacity,
          {
            ...StyleSheet.absoluteFillObject,
            zIndex: 99,
            backgroundColor: colors.backgroundDefault,
            height: headerHeight
          }
        ]}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            overflow: 'hidden',
            marginTop: useSafeAreaInsets().top + (44 - StyleConstants.Font.Size.L) / 2
          }}
        >
          <Animated.View style={[{ flexDirection: 'row' }, styleMarginTop]}>
            {account ? (
              <CustomText numberOfLines={1}>
                <ParseEmojis
                  content={account.display_name || account.username}
                  emojis={account.emojis}
                  fontBold
                />
              </CustomText>
            ) : null}
          </Animated.View>
        </View>
      </Animated.View>
    )
  },
  (_, next) => next.account === undefined
)

export default AccountNav
