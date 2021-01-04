import React from 'react'
import { Dimensions, Modal, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@utils/styles/ThemeManager'
import { StyleConstants } from '@utils/styles/constants'
import Button from '@components/Button'
import { PanGestureHandler } from 'react-native-gesture-handler'
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'

export interface Props {
  children: React.ReactNode
  visible: boolean
  handleDismiss: () => void
}

const BottomSheet: React.FC<Props> = ({ children, visible, handleDismiss }) => {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()

  const screenHeight = Dimensions.get('screen').height
  const panY = useSharedValue(0)
  const styleTop = useAnimatedStyle(() => {
    return {
      top: interpolate(
        panY.value,
        [0, screenHeight],
        [0, screenHeight],
        Extrapolate.CLAMP
      )
    }
  })
  const callDismiss = () => {
    handleDismiss()
  }
  const onGestureEvent = useAnimatedGestureHandler({
    onActive: ({ translationY }) => {
      panY.value = translationY
    },
    onEnd: ({ velocityY }) => {
      if (velocityY > 500) {
        runOnJS(callDismiss)()
      } else {
        panY.value = withTiming(0)
      }
    }
  })

  return (
    <Modal animated animationType='fade' visible={visible} transparent>
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        <Animated.View
          style={[styles.overlay, { backgroundColor: theme.backgroundOverlay }]}
        >
          <Animated.View
            style={[
              styles.container,
              styleTop,
              {
                backgroundColor: theme.background,
                paddingBottom: insets.bottom || StyleConstants.Spacing.L
              }
            ]}
          >
            <View
              style={[styles.handle, { backgroundColor: theme.primaryOverlay }]}
            />
            {children}
            <Button
              type='text'
              content='取消'
              onPress={() => handleDismiss()}
              style={styles.button}
            />
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  container: {
    paddingTop: StyleConstants.Spacing.M
  },
  handle: {
    alignSelf: 'center',
    width: StyleConstants.Spacing.S * 8,
    height: StyleConstants.Spacing.S / 2,
    borderRadius: 100,
    top: -StyleConstants.Spacing.M * 2
  },
  button: {
    marginHorizontal: StyleConstants.Spacing.Global.PagePadding * 2
  }
})

export default BottomSheet
