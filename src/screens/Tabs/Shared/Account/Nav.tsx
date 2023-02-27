import GracefullyImage from '@components/GracefullyImage'
import { ParseEmojis } from '@components/Parse'
import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AccountContext from './Context'

export interface Props {
  scrollY: Animated.SharedValue<number>
}

const AccountNav: React.FC<Props> = ({ scrollY }) => {
  const { account } = useContext(AccountContext)

  const { colors } = useTheme()
  const headerHeight = useSafeAreaInsets().top + 44

  const styleOpacity = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, 200], [0, 1], Extrapolate.CLAMP)
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
          marginTop: useSafeAreaInsets().top + StyleConstants.Font.Size.L / 2
        }}
      >
        <View
          style={{ flexDirection: 'row', alignItems: 'center', gap: StyleConstants.Spacing.XS }}
        >
          {account ? (
            <>
              <GracefullyImage
                sources={{ default: { uri: account.avatar_static } }}
                dimension={{
                  width: StyleConstants.Font.Size.L,
                  height: StyleConstants.Font.Size.L
                }}
                style={{ borderRadius: 99, overflow: 'hidden' }}
              />
              <CustomText numberOfLines={1}>
                <ParseEmojis
                  content={account.display_name || account.username}
                  emojis={account.emojis}
                  fontBold
                />
              </CustomText>
            </>
          ) : null}
        </View>
      </View>
    </Animated.View>
  )
}

export default AccountNav
