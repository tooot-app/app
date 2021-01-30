import { StackScreenProps } from '@react-navigation/stack'
import { getLocalAccount, getLocalUrl } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useEffect } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import {
  PanGestureHandler,
  State,
  TapGestureHandler
} from 'react-native-gesture-handler'
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
import { useSelector } from 'react-redux'
import ActionsAccount from './Actions/Account'
import ActionsDomain from './Actions/Domain'
import ActionsShare from './Actions/Share'
import ActionsStatus from './Actions/Status'

export type ScreenAccountProp = StackScreenProps<
  Nav.RootStackParamList,
  'Screen-Actions'
>

const ScreenActions = React.memo(
  ({
    route: {
      params: { queryKey, status, url, type }
    },
    navigation
  }: ScreenAccountProp) => {
    const localAccount = useSelector(getLocalAccount)
    const sameAccount = localAccount?.id === status.account.id

    const localDomain = useSelector(getLocalUrl)
    const statusDomain = status.uri
      ? status.uri.split(new RegExp(/\/\/(.*?)\//))[1]
      : ''
    const sameDomain = localDomain === statusDomain

    const { theme } = useTheme()
    const insets = useSafeAreaInsets()

    const DEFAULT_VALUE = 350
    const screenHeight = Dimensions.get('screen').height
    const panY = useSharedValue(DEFAULT_VALUE)
    useEffect(() => {
      panY.value = withTiming(0)
    }, [])
    const styleTop = useAnimatedStyle(() => {
      return {
        bottom: interpolate(
          panY.value,
          [0, screenHeight],
          [0, -screenHeight],
          Extrapolate.CLAMP
        )
      }
    })
    const dismiss = useCallback(() => {
      panY.value = withTiming(DEFAULT_VALUE)
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
            style={[
              styles.overlay,
              { backgroundColor: theme.backgroundOverlay }
            ]}
          >
            <PanGestureHandler onGestureEvent={onGestureEvent}>
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
                  style={[
                    styles.handle,
                    { backgroundColor: theme.primaryOverlay }
                  ]}
                />
                {!sameAccount && (
                  <ActionsAccount
                    queryKey={queryKey}
                    account={status.account}
                    dismiss={dismiss}
                  />
                )}

                {sameAccount && status && (
                  <ActionsStatus
                    navigation={navigation}
                    queryKey={queryKey}
                    status={status}
                    dismiss={dismiss}
                  />
                )}

                {!sameDomain && (
                  <ActionsDomain
                    queryKey={queryKey}
                    domain={statusDomain}
                    dismiss={dismiss}
                  />
                )}

                {url && type ? (
                  <ActionsShare url={url} type={type} dismiss={dismiss} />
                ) : null}
              </Animated.View>
            </PanGestureHandler>
          </Animated.View>
        </TapGestureHandler>
      </Animated.View>
    )
  },
  () => true
)

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
