import { RootStackScreenProps } from '@utils/navigation/navigators'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useEffect } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { PanGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler'
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ActionsAltText from './Actions/AltText'
import ActionsNotificationsFilter from './Actions/NotificationsFilter'

const ScreenActions = ({
  route: { params },
  navigation
}: RootStackScreenProps<'Screen-Actions'>) => {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  const DEFAULT_VALUE = 350
  const screenHeight = Dimensions.get('screen').height
  const panY = useSharedValue(DEFAULT_VALUE)
  useEffect(() => {
    panY.value = withTiming(0)
  }, [])
  const styleTop = useAnimatedStyle(() => {
    return {
      bottom: interpolate(panY.value, [0, screenHeight], [0, -screenHeight], Extrapolate.CLAMP)
    }
  })
  const dismiss = useCallback(() => {
    navigation.goBack()
  }, [])
  const onGestureEvent = useAnimatedGestureHandler({
    onActive: ({ translationY }) => {
      panY.value = translationY
    },
    onEnd: ({ velocityY }) => {
      if (velocityY > 500) {
        runOnJS(dismiss)()
      } else {
        panY.value = withTiming(0)
      }
    }
  })

  const actions = () => {
    switch (params.type) {
      case 'notifications_filter':
        return <ActionsNotificationsFilter />
      case 'alt_text':
        return <ActionsAltText text={params.text} />
    }
  }

  return (
    <Animated.View style={{ flex: 1 }}>
      <TapGestureHandler
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === State.ACTIVE) {
            dismiss()
          }
        }}
      >
        <Animated.View
          style={[styles.overlay, { backgroundColor: colors.backgroundOverlayInvert }]}
        >
          <PanGestureHandler onGestureEvent={onGestureEvent}>
            <Animated.View
              style={[
                styles.container,
                styleTop,
                {
                  backgroundColor: colors.backgroundDefault,
                  paddingBottom: insets.bottom || StyleConstants.Spacing.L
                }
              ]}
            >
              <View style={[styles.handle, { backgroundColor: colors.primaryOverlay }]} />
              {actions()}
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </TapGestureHandler>
    </Animated.View>
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

export default ScreenActions
