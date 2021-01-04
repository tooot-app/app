import SegmentedControl from '@react-native-community/segmented-control'
import { StyleConstants } from '@root/utils/styles/constants'
import { useTheme } from '@root/utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AccountContext from './utils/createContext'

export interface Props {
  scrollY: Animated.SharedValue<number>
}

const AccountSegmentedControl: React.FC<Props> = ({ scrollY }) => {
  const { accountState, accountDispatch } = useContext(AccountContext)
  const { t } = useTranslation('sharedAccount')
  const { mode, theme } = useTheme()

  const headerHeight = useSafeAreaInsets().top + 44
  const styleTransform = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [
              0,
              (accountState.informationLayout?.y || 0) +
                (accountState.informationLayout?.height || 0) -
                headerHeight
            ],
            [
              0,
              -(accountState.informationLayout?.y || 0) -
                (accountState.informationLayout?.height || 0) +
                headerHeight
            ],
            Extrapolate.CLAMP
          )
        }
      ]
    }
  })

  return (
    <Animated.View
      style={[
        styles.base,
        styleTransform,
        {
          top:
            (accountState.informationLayout?.y || 0) +
            (accountState.informationLayout?.height || 0),
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

export default React.memo(AccountSegmentedControl, () => true)
