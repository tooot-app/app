import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext, useEffect } from 'react'
import { Dimensions, Image } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import AccountContext from './utils/createContext'

export interface Props {
  account?: Mastodon.Account
  limitHeight?: boolean
}

const AccountHeader: React.FC<Props> = ({ account, limitHeight = false }) => {
  const { accountState, accountDispatch } = useContext(AccountContext)
  const { theme } = useTheme()

  const height = useSharedValue(
    Dimensions.get('screen').width * accountState.headerRatio
  )
  const styleHeight = useAnimatedStyle(() => {
    return {
      height: withTiming(height.value)
    }
  })

  useEffect(() => {
    if (
      account?.header &&
      !account.header.includes('/headers/original/missing.png')
    ) {
      Image.getSize(account.header, (width, height) => {
        if (!limitHeight) {
          accountDispatch({
            type: 'headerRatio',
            payload: height / width
          })
        }
      })
    }
  }, [account])

  return (
    <Animated.View
      // source={{ uri: account?.header }}
      style={[styleHeight, { backgroundColor: theme.disabled }]}
    />
  )
}

export default React.memo(
  AccountHeader,
  (_, next) => next.account === undefined
)
