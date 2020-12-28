import Emojis from '@root/components/Timelines/Timeline/Shared/Emojis'
import { StyleConstants } from '@root/utils/styles/constants'
import { useTheme } from '@root/utils/styles/ThemeManager'
import React from 'react'
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AccountState } from '../Account'

export interface Props {
  accountState: AccountState
  scrollY: Animated.Value
  account: Mastodon.Account | undefined
}

const AccountNav: React.FC<Props> = ({ accountState, scrollY, account }) => {
  const { theme } = useTheme()
  const headerHeight = useSafeAreaInsets().top + 44

  const nameY =
    Dimensions.get('screen').width * accountState.headerRatio +
    StyleConstants.Avatar.L -
    StyleConstants.Spacing.Global.PagePadding * 2 +
    StyleConstants.Spacing.M -
    headerHeight

  return (
    <Animated.View
      style={[
        styles.base,
        {
          backgroundColor: theme.background,
          opacity: scrollY.interpolate({
            inputRange: [0, 200],
            outputRange: [0, 1],
            extrapolate: 'clamp'
          }),
          height: headerHeight
        }
      ]}
    >
      <View
        style={[
          styles.content,
          {
            marginTop:
              useSafeAreaInsets().top + (44 - StyleConstants.Font.Size.L) / 2
          }
        ]}
      >
        <Animated.View
          style={[
            styles.display_name,
            {
              marginTop: scrollY.interpolate({
                inputRange: [nameY, nameY + 20],
                outputRange: [50, 0],
                extrapolate: 'clamp'
              })
            }
          ]}
        >
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
        </Animated.View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99
  },
  content: {
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden'
  },
  display_name: {
    flexDirection: 'row'
  }
})

export default AccountNav
