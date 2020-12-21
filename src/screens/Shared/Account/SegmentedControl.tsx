import SegmentedControl from '@react-native-community/segmented-control'
import { StyleConstants } from '@root/utils/styles/constants'
import { useTheme } from '@root/utils/styles/ThemeManager'
import React, { Dispatch } from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AccountAction, AccountState } from '../Account'

export interface Props {
  accountState: AccountState
  accountDispatch: Dispatch<AccountAction>
  scrollY: Animated.Value
}

const AccountSegmentedControl: React.FC<Props> = ({
  accountState,
  accountDispatch,
  scrollY
}) => {
  const { t } = useTranslation('sharedAccount')
  const { mode, theme } = useTheme()

  const headerHeight = useSafeAreaInsets().top + 44
  const translateY = scrollY.interpolate({
    inputRange: [
      0,
      (accountState.informationLayout?.y || 0) +
        (accountState.informationLayout?.height || 0) -
        headerHeight
    ],
    outputRange: [
      0,
      -(accountState.informationLayout?.y || 0) -
        (accountState.informationLayout?.height || 0) +
        headerHeight
    ],
    extrapolate: 'clamp',
    easing: undefined
  })

  return (
    <Animated.View
      style={[
        styles.base,
        {
          top:
            (accountState.informationLayout?.y || 0) +
            (accountState.informationLayout?.height || 0),
          transform: [{ translateY }],
          borderTopColor: theme.border,
          backgroundColor: theme.background
        }
      ]}
    >
      <SegmentedControl
        values={[
          t('content.segments.left'),
          t('content.segments.middle'),
          t('content.segments.right')
        ]}
        selectedIndex={accountState.segmentedIndex}
        onChange={({ nativeEvent }) =>
          accountDispatch({
            type: 'segmentedIndex',
            payload: nativeEvent.selectedSegmentIndex
          })
        }
        appearance={mode}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: StyleConstants.Spacing.Global.PagePadding,
    height: 33 + StyleConstants.Spacing.Global.PagePadding * 2
  }
})

export default AccountSegmentedControl
