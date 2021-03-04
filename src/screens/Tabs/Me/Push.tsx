import { MenuContainer, MenuRow } from '@components/Menu'
import { updateInstancePush } from '@utils/slices/instances/updatePush'
import { updateInstancePushAlert } from '@utils/slices/instances/updatePushAlert'
import { updateInstancePushDecode } from '@utils/slices/instances/updatePushDecode'
import { getInstancePush } from '@utils/slices/instancesSlice'
import * as WebBrowser from 'expo-web-browser'
import * as Notifications from 'expo-notifications'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'
import layoutAnimation from '@utils/styles/layoutAnimation'
import Button from '@components/Button'
import { StyleConstants } from '@utils/styles/constants'
import { AppState, Linking } from 'react-native'

const ScreenMeSettingsPush: React.FC = () => {
  const { t } = useTranslation('meSettingsPush')

  const dispatch = useDispatch()
  const instancePush = useSelector(getInstancePush)

  const [pushEnabled, setPushEnabled] = useState<boolean>()
  const [pushCanAskAgain, setPushCanAskAgain] = useState<boolean>()
  const checkPush = async () => {
    const settings = await Notifications.getPermissionsAsync()
    layoutAnimation()
    setPushEnabled(settings.granted)
    setPushCanAskAgain(settings.canAskAgain)
  }
  useEffect(() => {
    checkPush()
    AppState.addEventListener('change', () => checkPush())
    return () => {
      AppState.removeEventListener('change', () => {})
    }
  }, [])

  const isLoading = instancePush?.global.loading || instancePush?.decode.loading

  const alerts = useMemo(() => {
    return instancePush?.alerts
      ? (['follow', 'favourite', 'reblog', 'mention', 'poll'] as [
          'follow',
          'favourite',
          'reblog',
          'mention',
          'poll'
        ]).map(alert => (
          <MenuRow
            key={alert}
            title={t(`content.${alert}.heading`)}
            switchDisabled={
              !pushEnabled || !instancePush.global.value || isLoading
            }
            switchValue={instancePush?.alerts[alert].value}
            switchOnValueChange={() =>
              dispatch(
                updateInstancePushAlert({
                  changed: alert,
                  alerts: {
                    ...instancePush.alerts,
                    [alert]: {
                      ...instancePush?.alerts[alert],
                      value: !instancePush?.alerts[alert].value
                    }
                  }
                })
              )
            }
          />
        ))
      : null
  }, [instancePush?.global, instancePush?.alerts, isLoading])

  return (
    <ScrollView>
      {pushEnabled === false ? (
        <MenuContainer>
          <Button
            type='text'
            content={
              pushCanAskAgain
                ? t('content.enable.direct')
                : t('content.enable.settings')
            }
            style={{
              marginTop: StyleConstants.Spacing.Global.PagePadding,
              marginHorizontal: StyleConstants.Spacing.Global.PagePadding * 2
            }}
            onPress={async () => {
              if (pushCanAskAgain) {
                const result = await Notifications.requestPermissionsAsync()
                setPushEnabled(result.granted)
                setPushCanAskAgain(result.canAskAgain)
              } else {
                Linking.openURL('app-settings:')
              }
            }}
          />
        </MenuContainer>
      ) : null}
      <MenuContainer>
        <MenuRow
          title={t('content.global.heading')}
          description={t('content.global.description')}
          loading={instancePush?.global.loading}
          switchDisabled={!pushEnabled || isLoading}
          switchValue={
            pushEnabled === false ? false : instancePush?.global.value
          }
          switchOnValueChange={() =>
            dispatch(updateInstancePush(!instancePush?.global.value))
          }
        />
      </MenuContainer>
      <MenuContainer>
        <MenuRow
          title={t('content.decode.heading')}
          description={t('content.decode.description')}
          loading={instancePush?.decode.loading}
          switchDisabled={
            !pushEnabled || !instancePush?.global.value || isLoading
          }
          switchValue={instancePush?.decode.value}
          switchOnValueChange={() =>
            dispatch(updateInstancePushDecode(!instancePush?.decode.value))
          }
        />
        <MenuRow
          title={t('content.howitworks')}
          iconBack='ExternalLink'
          onPress={() =>
            WebBrowser.openBrowserAsync('https://tooot.app/how-push-works')
          }
        />
      </MenuContainer>
      <MenuContainer>{alerts}</MenuContainer>
    </ScrollView>
  )
}

export default ScreenMeSettingsPush
