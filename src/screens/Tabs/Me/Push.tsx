import Button from '@components/Button'
import Icon from '@components/Icon'
import { MenuContainer, MenuRow } from '@components/Menu'
import CustomText from '@components/Text'
import browserPackage from '@helpers/browserPackage'
import { PERMISSION_MANAGE_REPORTS, PERMISSION_MANAGE_USERS } from '@helpers/permissions'
import { useAppDispatch } from '@root/store'
import { isDevelopment } from '@utils/checkEnvironment'
import { useProfileQuery } from '@utils/queryHooks/profile'
import { getExpoToken } from '@utils/slices/appSlice'
import { updateInstancePush } from '@utils/slices/instances/updatePush'
import { updateInstancePushAlert } from '@utils/slices/instances/updatePushAlert'
import { updateInstancePushDecode } from '@utils/slices/instances/updatePushDecode'
import { getInstanceAccount, getInstancePush, getInstanceUri } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Notifications from 'expo-notifications'
import * as WebBrowser from 'expo-web-browser'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState, Linking, ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'

export const PUSH_DEFAULT: [
  'follow',
  'follow_request',
  'favourite',
  'reblog',
  'mention',
  'poll',
  'status'
] = ['follow', 'follow_request', 'favourite', 'reblog', 'mention', 'poll', 'status']
export const PUSH_ADMIN: { type: 'admin.sign_up' | 'admin.report'; permission: number }[] = [
  { type: 'admin.sign_up', permission: PERMISSION_MANAGE_USERS },
  { type: 'admin.report', permission: PERMISSION_MANAGE_REPORTS }
]
export const checkPushAdminPermission = (
  permission: number,
  permissions?: string | number
): boolean =>
  permissions
    ? !!(
        (typeof permissions === 'string' ? parseInt(permissions || '0') : permissions) & permission
      )
    : false

const TabMePush: React.FC = () => {
  const { colors } = useTheme()
  const { t } = useTranslation('screenTabs')
  const instanceAccount = useSelector(getInstanceAccount, (prev, next) => prev?.acct === next?.acct)
  const instanceUri = useSelector(getInstanceUri)

  const dispatch = useAppDispatch()
  const instancePush = useSelector(getInstancePush)

  const [pushAvailable, setPushAvailable] = useState<boolean>()
  const [pushEnabled, setPushEnabled] = useState<boolean>()
  const [pushCanAskAgain, setPushCanAskAgain] = useState<boolean>()
  const checkPush = async () => {
    const settings = await Notifications.getPermissionsAsync()
    layoutAnimation()
    setPushEnabled(settings.granted)
    setPushCanAskAgain(settings.canAskAgain)
  }
  const expoToken = useSelector(getExpoToken)
  useEffect(() => {
    if (isDevelopment) {
      setPushAvailable(true)
    } else {
      setPushAvailable(!!expoToken)
    }

    checkPush()
    const subscription = AppState.addEventListener('change', checkPush)
    return () => {
      subscription.remove()
    }
  }, [])

  const alerts = () =>
    instancePush?.alerts
      ? PUSH_DEFAULT.map(alert => (
          <MenuRow
            key={alert}
            title={t(`me.push.${alert}.heading`)}
            switchDisabled={!pushEnabled || !instancePush.global}
            switchValue={instancePush?.alerts[alert]}
            switchOnValueChange={() =>
              dispatch(
                updateInstancePushAlert({
                  changed: alert,
                  alerts: {
                    ...instancePush?.alerts,
                    [alert]: instancePush?.alerts[alert]
                  }
                })
              )
            }
          />
        ))
      : null

  const profileQuery = useProfileQuery()
  const adminAlerts = () =>
    profileQuery.data?.role?.permissions
      ? PUSH_ADMIN.map(({ type, permission }) =>
          checkPushAdminPermission(permission, profileQuery.data.role?.permissions) ? (
            <MenuRow
              key={type}
              title={t(`me.push.${type}.heading`)}
              switchDisabled={!pushEnabled || !instancePush.global}
              switchValue={instancePush?.alerts[type]}
              switchOnValueChange={() =>
                dispatch(
                  updateInstancePushAlert({
                    changed: type,
                    alerts: {
                      ...instancePush?.alerts,
                      [type]: instancePush?.alerts[type]
                    }
                  })
                )
              }
            />
          ) : null
        )
      : null

  return (
    <ScrollView>
      {!!pushAvailable ? (
        <>
          {pushEnabled === false ? (
            <MenuContainer>
              <Button
                type='text'
                content={
                  pushCanAskAgain ? t('me.push.enable.direct') : t('me.push.enable.settings')
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
              switchDisabled={!pushEnabled}
              switchValue={pushEnabled === false ? false : instancePush?.global}
              switchOnValueChange={() => dispatch(updateInstancePush(!instancePush?.global))}
            />
          </MenuContainer>
          <MenuContainer>
            <MenuRow
              title={t('me.push.decode.heading')}
              description={t('me.push.decode.description')}
              loading={instancePush?.decode}
              switchDisabled={!pushEnabled || !instancePush?.global}
              switchValue={instancePush?.decode}
              switchOnValueChange={() => dispatch(updateInstancePushDecode(!instancePush?.decode))}
            />
            <MenuRow
              title={t('me.push.howitworks')}
              iconBack='ExternalLink'
              onPress={async () =>
                WebBrowser.openBrowserAsync('https://tooot.app/how-push-works', {
                  browserPackage: await browserPackage()
                })
              }
            />
          </MenuContainer>
          <MenuContainer children={alerts()} />
          <MenuContainer children={adminAlerts()} />
        </>
      ) : (
        <View
          style={{
            flex: 1,
            minHeight: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: StyleConstants.Spacing.Global.PagePadding
          }}
        >
          <Icon name='Frown' size={StyleConstants.Font.Size.L} color={colors.primaryDefault} />
          <CustomText
            fontStyle='M'
            style={{
              color: colors.primaryDefault,
              textAlign: 'center',
              marginTop: StyleConstants.Spacing.S
            }}
          >
            {t('me.push.notAvailable')}
          </CustomText>
        </View>
      )}
    </ScrollView>
  )
}

export default TabMePush
