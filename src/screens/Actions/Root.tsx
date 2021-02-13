import analytics from '@components/analytics'
import Button from '@components/Button'
import { StackScreenProps } from '@react-navigation/stack'
import { getLocalAccount, getLocalUrl } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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
import ActionsAccount from './Account'
import ActionsDomain from './Domain'
import ActionsShare from './Share'
import ActionsStatus from './Status'

export type ScreenAccountProp = StackScreenProps<
  Nav.RootStackParamList,
  'Screen-Actions'
>

const ScreenActionsRoot = React.memo(
  ({ route: { params }, navigation }: ScreenAccountProp) => {
    const { t } = useTranslation()

    const localAccount = useSelector(
      getLocalAccount,
      (prev, next) => prev?.id === next?.id
    )
    let sameAccount = false
    switch (params.type) {
      case 'status':
        sameAccount = localAccount?.id === params.status.account.id
        break
      case 'account':
        sameAccount = localAccount?.id === params.account.id
        break
    }

    const localDomain = useSelector(getLocalUrl)
    let sameDomain = true
    let statusDomain: string
    switch (params.type) {
      case 'status':
        statusDomain = params.status.uri
          ? params.status.uri.split(new RegExp(/\/\/(.*?)\//))[1]
          : ''
        sameDomain = localDomain === statusDomain
        break
    }

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

    const actions = useMemo(() => {
      switch (params.type) {
        case 'status':
          return (
            <>
              {!sameAccount && (
                <ActionsAccount
                  queryKey={params.queryKey}
                  rootQueryKey={params.rootQueryKey}
                  account={params.status.account}
                  dismiss={dismiss}
                />
              )}
              {sameAccount && params.status && (
                <ActionsStatus
                  navigation={navigation}
                  queryKey={params.queryKey}
                  rootQueryKey={params.rootQueryKey}
                  status={params.status}
                  dismiss={dismiss}
                />
              )}
              {!sameDomain && statusDomain && (
                <ActionsDomain
                  queryKey={params.queryKey}
                  rootQueryKey={params.rootQueryKey}
                  domain={statusDomain}
                  dismiss={dismiss}
                />
              )}
              <ActionsShare
                url={params.status.url || params.status.uri}
                type={params.type}
                dismiss={dismiss}
              />
            </>
          )
        case 'account':
          return (
            <>
              {!sameAccount && (
                <ActionsAccount account={params.account} dismiss={dismiss} />
              )}
              <ActionsShare
                url={params.account.url}
                type={params.type}
                dismiss={dismiss}
              />
            </>
          )
      }
    }, [])

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
                {actions}
                <Button
                  type='text'
                  content={t('common:buttons.cancel')}
                  onPress={() => {
                    analytics('bottomsheet_cancel')
                    // dismiss()
                  }}
                  style={styles.button}
                />
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

export default ScreenActionsRoot
