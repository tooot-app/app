import Button from '@components/Button'
import Icon from '@components/Icon'
import { MenuContainer, MenuRow } from '@components/Menu'
import { displayMessage } from '@components/Message'
import CustomText from '@components/Text'
import * as Sentry from '@sentry/react-native'
import apiInstance from '@utils/api/instance'
import apiTooot, { TOOOT_API_DOMAIN } from '@utils/api/tooot'
import browserPackage from '@utils/helpers/browserPackage'
import { isDevelopment } from '@utils/helpers/checkEnvironment'
import { PUSH_ADMIN, PUSH_DEFAULT, setChannels } from '@utils/push/constants'
import { updateExpoToken } from '@utils/push/updateExpoToken'
import { useAppsQuery } from '@utils/queryHooks/apps'
import { useProfileQuery } from '@utils/queryHooks/profile'
import { setAccountStorage, useAccountStorage, useGlobalStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Notifications from 'expo-notifications'
import * as WebBrowser from 'expo-web-browser'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState, Linking, Platform, ScrollView, View } from 'react-native'

const TabMePush: React.FC = () => {
  const { colors } = useTheme()
  const { t } = useTranslation('screenTabs')

  const [expoToken] = useGlobalStorage.string('app.expo_token')
  const [push] = useAccountStorage.object('push')
  const [domain] = useAccountStorage.string('auth.domain')
  const [accountAcct] = useAccountStorage.string('auth.account.acct')
  const [accountDomain] = useAccountStorage.string('auth.account.domain')
  const [accountId] = useAccountStorage.string('auth.account.id')

  const appsQuery = useAppsQuery({
    options: {
      onSuccess: async data => {
        if (data.vapid_key) {
          await checkPush()
          if (isDevelopment) {
            setPushAvailable(true)
          } else {
            setPushAvailable(!!expoToken?.length)
          }
        }
      }
    }
  })

  const checkPush = async () => {
    const permissions = await Notifications.getPermissionsAsync()
    setPushEnabled(permissions.granted)
    setPushCanAskAgain(permissions.canAskAgain)
    layoutAnimation()
    await updateExpoToken()
  }

  const [pushAvailable, setPushAvailable] = useState<boolean>()
  const [pushEnabled, setPushEnabled] = useState<boolean>()
  const [pushCanAskAgain, setPushCanAskAgain] = useState<boolean>()

  useEffect(() => {
    const subscription = AppState.addEventListener('change', checkPush)
    return () => {
      subscription.remove()
    }
  }, [])

  const alerts = () =>
    push?.alerts
      ? PUSH_DEFAULT().map(alert => (
          <MenuRow
            key={alert}
            title={t(`me.push.${alert}.heading`)}
            switchDisabled={!pushEnabled || !push.global}
            switchValue={push?.alerts[alert]}
            switchOnValueChange={async () => {
              const alerts = { ...push?.alerts, [alert]: !push?.alerts[alert] }
              const formData = new FormData()
              for (const [key, value] of Object.entries(alerts)) {
                formData.append(`data[alerts][${key}]`, value.toString())
              }

              await apiInstance<Mastodon.PushSubscription>({
                method: 'put',
                url: 'push/subscription',
                body: formData
              })

              setAccountStorage([{ key: 'push', value: { ...push, alerts } }])
            }}
          />
        ))
      : null

  const profileQuery = useProfileQuery()
  const adminAlerts = () =>
    profileQuery.data?.role?.permissions
      ? PUSH_ADMIN().map(({ type }) => (
          <MenuRow
            key={type}
            title={t(`me.push.${type}.heading`)}
            switchDisabled={!pushEnabled || !push.global}
            switchValue={push?.alerts[type]}
            switchOnValueChange={async () => {
              const alerts = { ...push?.alerts, [type]: !push?.alerts[type] }
              const formData = new FormData()
              for (const [key, value] of Object.entries(alerts)) {
                formData.append(`data[alerts][${key}]`, value.toString())
              }

              await apiInstance<Mastodon.PushSubscription>({
                method: 'put',
                url: 'push/subscription',
                body: formData
              })

              setAccountStorage([{ key: 'push', value: { ...push, alerts } }])
            }}
          />
        ))
      : null

  const pushPath = `${expoToken}/${domain}/${accountId}`
  const accountFull = `@${accountAcct}@${accountDomain}`

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
                  title={t('me.push.global.heading', { acct: `@${accountAcct}@${accountDomain}` })}
                  description={t('me.push.global.description')}
                  switchDisabled={!pushEnabled}
                  switchValue={pushEnabled === false ? false : push?.global}
                  switchOnValueChange={async () => {
                    if (push.global) {
                      // Turning off
                      await apiInstance({
                        method: 'delete',
                        url: 'push/subscription'
                      })
                      await apiTooot({
                        method: 'delete',
                        url: `push/unsubscribe/${pushPath}`
                      })

                      if (Platform.OS === 'android') {
                        Notifications.deleteNotificationChannelGroupAsync(accountFull)
                      }

                      setAccountStorage([{ key: 'push', value: { ...push, global: false } }])
                    } else {
                      // Turning on
                      const randomPath = (Math.random() + 1).toString(36).substring(2)

                      const endpoint = `https://${TOOOT_API_DOMAIN}/push/send/${pushPath}/${randomPath}`

                      const formData = new FormData()
                      formData.append('subscription[endpoint]', endpoint)
                      formData.append(
                        'subscription[keys][p256dh]',
                        'BMn2PLpZrMefG981elzG6SB1EY9gU7QZwmtZ/a/J2vUeWG+zXgeskMPwHh4T/bxsD4l7/8QT94F57CbZqYRRfJo='
                      )
                      formData.append('subscription[keys][auth]', push.key)
                      for (const [key, value] of Object.entries(push.alerts)) {
                        formData.append(`data[alerts][${key}]`, value.toString())
                      }

                      const res = await apiInstance<Mastodon.PushSubscription>({
                        method: 'post',
                        url: 'push/subscription',
                        body: formData
                      })

                      if (!res.body.server_key?.length) {
                        displayMessage({
                          type: 'danger',
                          duration: 'long',
                          message: t('me.push.missingServerKey.message'),
                          description: t('me.push.missingServerKey.description')
                        })
                        Sentry.setContext('Push server key', {
                          instance: domain,
                          resBody: res.body
                        })
                        Sentry.captureMessage('Push register error')
                        return Promise.reject()
                      }

                      await apiTooot({
                        method: 'post',
                        url: `push/subscribe/${pushPath}`,
                        body: {
                          accountFull,
                          serverKey: res.body.server_key,
                          auth: push.decode === false ? null : push.key
                        }
                      })

                      setAccountStorage([{ key: 'push', value: { ...push, global: true } }])

                      if (Platform.OS === 'android') {
                        setChannels(true)
                      }
                    }
                  }}
                />
              </MenuContainer>
              <MenuContainer>
                <MenuRow
                  title={t('me.push.decode.heading')}
                  description={t('me.push.decode.description')}
                  switchDisabled={!pushEnabled || !push?.global}
                  switchValue={push?.decode}
                  switchOnValueChange={async () => {
                    await apiTooot({
                      method: 'put',
                      url: `push/update-decode/${pushPath}`,
                      body: { auth: push?.decode ? null : push.key }
                    })

                    setAccountStorage([{ key: 'push', value: { ...push, decode: !push.decode } }])

                    if (Platform.OS === 'android') {
                      setChannels(true)
                    }
                  }}
                />
                <MenuRow
                  title={t('me.push.howitworks')}
                  iconBack='ExternalLink'
                  onPress={async () =>
                    WebBrowser.openBrowserAsync('https://tooot.app/how-push-works', {
                      ...(await browserPackage())
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
