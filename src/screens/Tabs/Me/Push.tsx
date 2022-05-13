import analytics from '@components/analytics'
import Button from '@components/Button'
import Icon from '@components/Icon'
import { MenuContainer, MenuRow } from '@components/Menu'
import CustomText from '@components/Text'
import { useAppDispatch } from '@root/store'
import { isDevelopment } from '@utils/checkEnvironment'
import { updateInstancePush } from '@utils/slices/instances/updatePush'
import { updateInstancePushAlert } from '@utils/slices/instances/updatePushAlert'
import { updateInstancePushDecode } from '@utils/slices/instances/updatePushDecode'
import {
  clearPushLoading,
  getInstanceAccount,
  getInstancePush,
  getInstanceUri
} from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Notifications from 'expo-notifications'
import * as WebBrowser from 'expo-web-browser'
import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState, Linking, ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'

const TabMePush: React.FC = () => {
  const { colors } = useTheme()
  const { t } = useTranslation('screenTabs')
  const instanceAccount = useSelector(
    getInstanceAccount,
    (prev, next) => prev?.acct === next?.acct
  )
  const instanceUri = useSelector(getInstanceUri)

  const dispatch = useAppDispatch()
  const instancePush = useSelector(getInstancePush)

  const [pushAvailable, setPushAvailable] = useState<boolean | undefined>(
    undefined
  )
  const [pushEnabled, setPushEnabled] = useState<boolean>()
  const [pushCanAskAgain, setPushCanAskAgain] = useState<boolean>()
  const checkPush = async () => {
    const settings = await Notifications.getPermissionsAsync()
    layoutAnimation()
    setPushEnabled(settings.granted)
    setPushCanAskAgain(settings.canAskAgain)
  }
  useEffect(() => {
    if (isDevelopment) {
      setPushAvailable(true)
    } else {
      Notifications.getExpoPushTokenAsync({
        experienceId: '@xmflsct/tooot'
      })
        .then(data => setPushAvailable(!!data))
        .catch(() => setPushAvailable(false))
    }

    checkPush()
    const subscription = AppState.addEventListener('change', checkPush)
    return () => {
      subscription.remove()
    }
  }, [])

  useEffect(() => {
    dispatch(clearPushLoading())
  }, [])

  const isLoading = instancePush?.global.loading || instancePush?.decode.loading

  const alerts = useMemo(() => {
    return instancePush?.alerts
      ? (
          ['follow', 'favourite', 'reblog', 'mention', 'poll'] as [
            'follow',
            'favourite',
            'reblog',
            'mention',
            'poll'
          ]
        ).map(alert => (
          <MenuRow
            key={alert}
            title={t(`me.push.${alert}.heading`)}
            switchDisabled={
              !pushEnabled || !instancePush.global.value || isLoading
            }
            switchValue={instancePush?.alerts[alert].value}
            switchOnValueChange={() => {
              analytics(`me_push_${alert}`, {
                current: instancePush?.alerts[alert].value,
                new: !instancePush?.alerts[alert].value
              })
              dispatch(
                updateInstancePushAlert({
                  changed: alert,
                  alerts: {
                    ...instancePush?.alerts,
                    [alert]: {
                      ...instancePush?.alerts[alert],
                      value: !instancePush?.alerts[alert].value
                    }
                  }
                })
              )
            }}
          />
        ))
      : null
  }, [pushEnabled, instancePush?.global, instancePush?.alerts, isLoading])

  return (
    <ScrollView>
      {pushAvailable === true ? (
        <>
          {pushEnabled === false ? (
            <MenuContainer>
              <Button
                type='text'
                content={
                  pushCanAskAgain
                    ? t('me.push.enable.direct')
                    : t('me.push.enable.settings')
                }
                style={{
                  marginTop: StyleConstants.Spacing.Global.PagePadding,
                  marginHorizontal:
                    StyleConstants.Spacing.Global.PagePadding * 2
                }}
                onPress={async () => {
                  if (pushCanAskAgain) {
                    analytics('me_push_enabled_dialogue')
                    const result = await Notifications.requestPermissionsAsync()
                    setPushEnabled(result.granted)
                    setPushCanAskAgain(result.canAskAgain)
                  } else {
                    analytics('me_push_enabled_setting')
                    Linking.openSettings()
                  }
                }}
              />
            </MenuContainer>
          ) : null}
          <MenuContainer>
            <MenuRow
              title={t('me.push.global.heading', {
                acct: `@${instanceAccount?.acct}@${instanceUri}`
              })}
              description={t('me.push.global.description')}
              loading={instancePush?.global.loading}
              switchDisabled={!pushEnabled || isLoading}
              switchValue={
                pushEnabled === false ? false : instancePush?.global.value
              }
              switchOnValueChange={() => {
                analytics('me_push_global', {
                  current: instancePush?.global.value,
                  new: !instancePush?.global.value
                })
                dispatch(updateInstancePush(!instancePush?.global.value))
              }}
            />
          </MenuContainer>
          <MenuContainer>
            <MenuRow
              title={t('me.push.decode.heading')}
              description={t('me.push.decode.description')}
              loading={instancePush?.decode.loading}
              switchDisabled={
                !pushEnabled || !instancePush?.global.value || isLoading
              }
              switchValue={instancePush?.decode.value}
              switchOnValueChange={() => {
                analytics('me_push_decode', {
                  current: instancePush?.decode.value,
                  new: !instancePush?.decode.value
                })
                dispatch(updateInstancePushDecode(!instancePush?.decode.value))
              }}
            />
            <MenuRow
              title={t('me.push.howitworks')}
              iconBack='ExternalLink'
              onPress={() => {
                analytics('me_push_howitworks')
                WebBrowser.openBrowserAsync('https://tooot.app/how-push-works')
              }}
            />
          </MenuContainer>
          <MenuContainer>{alerts}</MenuContainer>
        </>
      ) : (
        <View
          style={{
            flex: 1,
            minHeight: '100%',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Icon
            name='Frown'
            size={StyleConstants.Font.Size.L}
            color={colors.primaryDefault}
          />
          <CustomText fontStyle='M' style={{ color: colors.primaryDefault }}>
            {t('me.push.notAvailable')}
          </CustomText>
        </View>
      )}
    </ScrollView>
  )
}

export default TabMePush
