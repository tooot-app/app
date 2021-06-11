import analytics from '@components/analytics'
import Button from '@components/Button'
import { StackScreenProps } from '@react-navigation/stack'
import {
  getInstanceAccount,
  getInstanceUrl
} from '@utils/slices/instancesSlice'
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
import ActionsNotificationsFilter from './NotificationsFilter'
import ActionsShare from './Share'
import ActionsStatus from './Status'

export type ScreenAccountProp = StackScreenProps<
  Nav.RootStackParamList,
  'Screen-Actions'
>

const ScreenActionsRoot = React.memo(
  ({ route: { params }, navigation }: ScreenAccountProp) => {
    const { t } = useTranslation()

    const instanceAccount = useSelector(
      getInstanceAccount,
      (prev, next) => prev?.id === next?.id
    )
    let sameAccount = false
    switch (params.type) {
      case 'status':
        sameAccount = instanceAccount?.id === params.status.account.id
        break
      case 'account':
        sameAccount = instanceAccount?.id === params.account.id
        break
    }

    const instanceDomain = useSelector(getInstanceUrl)
    let sameDomain = true
    let statusDomain: string
    switch (params.type) {
      case 'status':
        statusDomain = params.status.uri
          ? params.status.uri.split(new RegExp(/\/\/(.*?)\//))[1]
          : ''
        sameDomain = instanceDomain === statusDomain
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
              {!sameAccount ? (
                <ActionsAccount
                  queryKey={params.queryKey}
                  rootQueryKey={params.rootQueryKey}
                  account={params.status.account}
                  dismiss={dismiss}
                />
              ) : null}
              {sameAccount && params.status ? (
                <ActionsStatus
                  navigation={navigation}
                  queryKey={params.queryKey}
                  rootQueryKey={params.rootQueryKey}
                  status={params.status}
                  dismiss={dismiss}
                />
              ) : null}
              {!sameDomain && statusDomain ? (
                <ActionsDomain
                  queryKey={params.queryKey}
                  rootQueryKey={params.rootQueryKey}
                  domain={statusDomain}
                  dismiss={dismiss}
                />
              ) : null}
              {params.status.visibility !== 'direct' ? (
                <ActionsShare
                  url={params.status.url || params.status.uri}
                  type={params.type}
                  dismiss={dismiss}
                />
              ) : null}
              <Button
                type='text'
                content={t('common:buttons.cancel')}
                onPress={() => {
                  analytics('bottomsheet_acknowledge')
                }}
                style={styles.button}
              />
            </>
          )
        case 'account':
          return (
            <>
              {!sameAccount ? (
                <ActionsAccount account={params.account} dismiss={dismiss} />
              ) : null}
              <ActionsShare
                url={params.account.url}
                type={params.type}
                dismiss={dismiss}
              />
              <Button
                type='text'
                content={t('common:buttons.cancel')}
                onPress={() => {
                  analytics('bottomsheet_acknowledge')
                }}
                style={styles.button}
              />
            </>
          )
        case 'notifications_filter':
          return <ActionsNotificationsFilter />
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
              { backgroundColor: theme.backgroundOverlayInvert }
            ]}
          >
            <PanGestureHandler onGestureEvent={onGestureEvent}>
              <Animated.View
                style={[
                  styles.container,
                  styleTop,
                  {
                    backgroundColor: theme.backgroundDefault,
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
