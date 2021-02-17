import haptics from '@components/haptics'
import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'

export interface Props {
  scrollY: Animated.SharedValue<number>
  isLoading: boolean
  isFetching: boolean
  disable?: boolean
}

const CONTAINER_HEIGHT = StyleConstants.Spacing.M * 2.5

const TimelineRefresh = React.memo(
  ({ scrollY, isLoading, isFetching, disable = false }: Props) => {
    if (disable || isLoading) {
      return null
    }

    const { t } = useTranslation('componentTimeline')
    const { theme } = useTheme()

    const separation01 = -(
      CONTAINER_HEIGHT / 2 +
      StyleConstants.Font.Size.S / 2
    )
    const separation02 = -(
      CONTAINER_HEIGHT * 1.5 +
      StyleConstants.Font.Size.S / 2
    )
    const [textRight, setTextRight] = useState(0)
    const arrowY = useAnimatedStyle(() => ({
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, separation01],
            [
              -CONTAINER_HEIGHT / 2 - StyleConstants.Font.Size.M / 2,
              CONTAINER_HEIGHT / 2 - StyleConstants.Font.Size.S / 2
            ],
            Extrapolate.CLAMP
          )
        }
      ]
    }))
    const arrowTop = useAnimatedStyle(() => ({
      marginTop:
        scrollY.value < separation02
          ? withTiming(CONTAINER_HEIGHT)
          : withTiming(0)
    }))

    const arrowStage = useSharedValue(0)
    const onLayout = useCallback(
      ({ nativeEvent }) => {
        if (nativeEvent.layout.x + nativeEvent.layout.width > textRight) {
          setTextRight(nativeEvent.layout.x + nativeEvent.layout.width)
        }
      },
      [textRight]
    )
    useAnimatedReaction(
      () => {
        if (isFetching) {
          return false
        }
        switch (arrowStage.value) {
          case 0:
            if (scrollY.value < separation01) {
              arrowStage.value = 1
              return true
            }
            return false
          case 1:
            if (scrollY.value < separation02) {
              arrowStage.value = 2
              return true
            }
            if (scrollY.value > separation01) {
              arrowStage.value = 0
              return false
            }
            return false
          case 2:
            if (scrollY.value > separation02) {
              arrowStage.value = 1
              return false
            }
            return false
        }
      },
      data => {
        if (data) {
          runOnJS(haptics)('Light')
        }
      },
      [isFetching]
    )

    return (
      <View style={styles.base}>
        {isFetching ? (
          <View style={styles.container2}>
            <Circle size={StyleConstants.Font.Size.L} color={theme.secondary} />
          </View>
        ) : (
          <>
            <View style={styles.container1}>
              <Text
                style={[styles.explanation, { color: theme.primary }]}
                onLayout={onLayout}
                children={t('refresh.fetchPreviousPage')}
              />
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    left: textRight + StyleConstants.Spacing.S
                  },
                  arrowY,
                  arrowTop
                ]}
                children={
                  <Icon
                    name='ArrowLeft'
                    size={StyleConstants.Font.Size.M}
                    color={theme.primary}
                  />
                }
              />
            </View>
            <View style={styles.container2}>
              <Text
                style={[styles.explanation, { color: theme.primary }]}
                onLayout={onLayout}
                children={t('refresh.refetch')}
              />
            </View>
          </>
        )}
      </View>
    )
  },
  (prev, next) =>
    prev.isLoading === next.isLoading && prev.isFetching === next.isFetching
)

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: CONTAINER_HEIGHT * 2,
    alignItems: 'center'
  },
  container1: {
    flex: 1,
    flexDirection: 'row',
    height: CONTAINER_HEIGHT
  },
  container2: { height: CONTAINER_HEIGHT, justifyContent: 'center' },
  explanation: {
    fontSize: StyleConstants.Font.Size.S,
    lineHeight: CONTAINER_HEIGHT
  }
})

export default TimelineRefresh
