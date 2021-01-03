import { ParseEmojis } from '@components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { MutableRefObject, useContext } from 'react'
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AccountContext from './utils/createContext'

export interface Props {
  scrollY: MutableRefObject<Animated.Value>
  account: Mastodon.Account | undefined
}

const AccountNav: React.FC<Props> = ({ scrollY, account }) => {
  const { accountState } = useContext(AccountContext)
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
          opacity: scrollY.current.interpolate({
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
              marginTop: scrollY.current.interpolate({
                inputRange: [nameY, nameY + 20],
                outputRange: [50, 0],
                extrapolate: 'clamp'
              })
            }
          ]}
        >
          {account ? (
            <Text numberOfLines={1}>
              <ParseEmojis
                content={account.display_name || account.username}
                emojis={account.emojis}
                fontBold
              />
            </Text>
          ) : null}
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

export default React.memo(AccountNav, (_, next) => next.account === undefined)
