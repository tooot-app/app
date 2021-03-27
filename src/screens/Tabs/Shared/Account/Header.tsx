import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { Dimensions, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AccountContext from './utils/createContext'

export interface Props {
  account?: Mastodon.Account
  limitHeight?: boolean
}

const AccountHeader: React.FC<Props> = ({ account }) => {
  const { accountState } = useContext(AccountContext)
  const { reduceMotionEnabled } = useAccessibility()
  const { theme } = useTheme()
  const topInset = useSafeAreaInsets().top

  return (
    <Image
      source={{
        uri: reduceMotionEnabled ? account?.header_static : account?.header
      }}
      style={{
        height:
          Dimensions.get('screen').width * accountState.headerRatio + topInset,
        backgroundColor: theme.disabled
      }}
    />
  )
}

export default React.memo(
  AccountHeader,
  (_, next) => next.account === undefined
)
