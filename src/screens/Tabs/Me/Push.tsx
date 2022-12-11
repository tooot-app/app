import Button from '@components/Button'
import Icon from '@components/Icon'
import { MenuContainer, MenuRow } from '@components/Menu'
import CustomText from '@components/Text'
import browserPackage from '@helpers/browserPackage'
import { checkPermission } from '@helpers/permissions'
import { useAppDispatch } from '@root/store'
import { isDevelopment } from '@utils/checkEnvironment'
import { useAppsQuery } from '@utils/queryHooks/apps'
import { useProfileQuery } from '@utils/queryHooks/profile'
import { getExpoToken, retrieveExpoToken } from '@utils/slices/appSlice'
import { PUSH_ADMIN, PUSH_DEFAULT, setChannels } from '@utils/slices/instances/push/utils'
import { updateInstancePush } from '@utils/slices/instances/updatePush'
import { updateInstancePushAlert } from '@utils/slices/instances/updatePushAlert'
import { updateInstancePushDecode } from '@utils/slices/instances/updatePushDecode'
import { getInstance, getInstancePush } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Notifications from 'expo-notifications'
import * as WebBrowser from 'expo-web-browser'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState, Linking, Platform, ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'

const TabMePush: React.FC = () => {
  const { colors } = useTheme()
  const { t } = useTranslation('screenTabs')

  const instance = useSelector(getInstance)
  const expoToken = useSelector(getExpoToken)

  const appsQuery = useAppsQuery()

  const dispatch = useAppDispatch()
  const instancePush = useSelector(getInstancePush)

  const [pushAvailable, setPushAvailable] = useState<boolean>()
  const [pushEnabled, setPushEnabled] = useState<boolean>()
  const [pushCanAskAgain, setPushCanAskAgain] = useState<boolean>()

  useEffect(() => {
    const checkPush = async () => {
      switch (Platform.OS) {
        case 'ios':
          const settings = await Notifications.getPermissionsAsync()
          layoutAnimation()
          setPushEnabled(settings.granted)
          setPushCanAskAgain(settings.canAskAgain)
          break
        case 'android':
          await setChannels(instance)
          layoutAnimation()
          dispatch(retrieveExpoToken())
          break
      }
    }

    if (appsQuery.data?.vapid_key) {
      checkPush()

      if (isDevelopment) {
        setPushAvailable(true)
      } else {
        setPushAvailable(!!expoToken)
      }
    }

    const subscription = AppState.addEventListener('change', checkPush)
    return () => {
      subscription.remove()
    }
  }, [appsQuery.data?.vapid_key])

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
          checkPermission(permission, profileQuery.data.role?.permissions) ? (
            <MenuRow
              key={type}
              title={t(`me.push.${type}.heading`)}
              switchDisabled={!pushEnabled || !instancePush.global}
              switchValue={instancePush?.alerts[type]}
              switchOnValueChange={() =>
                dispatch(
                  updateInstancePushAlert({
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
      {!!appsQuery.data?.vapid_key ? (
        <>
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
                    acct: `@${instance.account.acct}@${instance.uri}`
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
                  switchOnValueChange={() =>
                    dispatch(updateInstancePushDecode(!instancePush?.decode))
                  }
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
            {t('me.push.missingServerKey.message')}
          </CustomText>
          <CustomText
            fontStyle='S'
            style={{
              color: colors.primaryDefault,
              textAlign: 'center'
            }}
          >
            {t('me.push.missingServerKey.description')}
          </CustomText>
        </View>
      )}
    </ScrollView>
  )
}

export default TabMePush
