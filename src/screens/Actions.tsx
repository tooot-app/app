import analytics from '@components/analytics'
import Button from '@components/Button'
import { RootStackScreenProps } from '@utils/navigation/navigators'
import {
  getInstanceAccount,
  getInstanceUrl
} from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useEffect } from 'react'
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
import {
  SafeAreaProvider,
  useSafeAreaInsets
} from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import ActionsAccount from './Actions/Account'
import ActionsAltText from './Actions/AltText'
import ActionsDomain from './Actions/Domain'
import ActionsNotificationsFilter from './Actions/NotificationsFilter'
import ActionsShare from './Actions/Share'
import ActionsStatus from './Actions/Status'

const ScreenActions = ({
  route: { params },
  navigation
}: RootStackScreenProps<'Screen-Actions'>) => {
  const { t } = useTranslation()

  const instanceAccount = useSelector(
    getInstanceAccount,
    (prev, next) => prev?.id === next?.id
  )
  let sameAccount = false
  switch (params.type) {
    case 'status':
      console.log('media length', params.status.media_attachments.length)
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

  const actions = () => {
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
      case 'alt_text':
        return <ActionsAltText text={params.text} />
    }
  }

  return (
    <SafeAreaProvider>
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
              { backgroundColor: colors.backgroundOverlayInvert }
            ]}
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
                <View
                  style={[
                    styles.handle,
                    { backgroundColor: colors.primaryOverlay }
                  ]}
                />
                {actions()}
              </Animated.View>
            </PanGestureHandler>
          </Animated.View>
        </TapGestureHandler>
      </Animated.View>
    </SafeAreaProvider>
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
