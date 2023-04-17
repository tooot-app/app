import Button from '@components/Button'
import Icon from '@components/Icon'
import { Loading } from '@components/Loading'
import { MenuContainer, MenuRow } from '@components/Menu'
import { displayMessage } from '@components/Message'
import openLink from '@components/openLink'
import CustomText from '@components/Text'
import * as Sentry from '@sentry/react-native'
import apiInstance from '@utils/api/instance'
import apiTooot, { TOOOT_API_DOMAIN } from '@utils/api/tooot'
import { PUSH_ADMIN, PUSH_DEFAULT, setChannels } from '@utils/push/constants'
import { updateExpoToken } from '@utils/push/updateExpoToken'
import { useAppsQuery } from '@utils/queryHooks/apps'
import { useProfileQuery } from '@utils/queryHooks/profile'
import { setAccountStorage, useAccountStorage, useGlobalStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Crypto from 'expo-crypto'
import * as Notifications from 'expo-notifications'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState, Linking, Platform, ScrollView, View } from 'react-native'
import { fromByteArray } from 'react-native-quick-base64'

const TabMePush: React.FC = () => {
  const { colors } = useTheme()
  const { t } = useTranslation('screenTabs')

  const [expoToken] = useGlobalStorage.string('app.expo_token')
  const [push] = useAccountStorage.object('push')
  const [domain] = useAccountStorage.string('auth.domain')
  const [accountAcct] = useAccountStorage.string('auth.account.acct')
  const [accountDomain] = useAccountStorage.string('auth.account.domain')
  const [accountId] = useAccountStorage.string('auth.account.id')

  const appsQuery = useAppsQuery()

  const [pushEnabled, setPushEnabled] = useState<boolean>()
  const [pushCanAskAgain, setPushCanAskAgain] = useState<boolean>()

  const checkPush = async () => {
    const permissions = await Notifications.getPermissionsAsync()
    setPushEnabled(permissions.granted)
    setPushCanAskAgain(permissions.canAskAgain)
    layoutAnimation()
    await updateExpoToken()
  }
  useEffect(() => {
    checkPush()
  }, [])
  useEffect(() => {
    checkPush()
  }, [pushEnabled])
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
            switchValue={push?.alerts[alert]}
            switchOnValueChange={async () => {
              const alerts = { ...push?.alerts, [alert]: !push?.alerts[alert] }

              if (pushEnabled && push.global) {
                const body: { data: { alerts: Mastodon.PushSubscription['alerts'] } } = {
                  data: { alerts }
                }
                await apiInstance<Mastodon.PushSubscription>({
                  method: 'put',
                  url: 'push/subscription',
                  body
                })
              }

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
            switchValue={push?.alerts[type]}
            switchOnValueChange={async () => {
              const alerts = { ...push?.alerts, [type]: !push?.alerts[type] }

              if (pushEnabled && push.global) {
                const body: {
                  data: { alerts: Mastodon.PushSubscription['alerts'] }
                } = {
                  data: { alerts }
                }
                await apiInstance<Mastodon.PushSubscription>({
                  method: 'put',
                  url: 'push/subscription',
                  body
                })
              }

              setAccountStorage([{ key: 'push', value: { ...push, alerts } }])
            }}
          />
        ))
      : null

  const pushPath = `${expoToken}/${domain}/${accountId}`
  const accountFull = `@${accountAcct}@${accountDomain}`

  return appsQuery.isFetched ? (
    <ScrollView>
      {!!appsQuery.data?.vapid_key ? (
        <>
          {!!expoToken?.length || (!expoToken?.length && !pushEnabled) ? (
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

                      setAccountStorage([{ key: 'push', value: { ...push, global: false } }])
                      if (Platform.OS === 'android') {
                        Notifications.deleteNotificationChannelGroupAsync(accountFull)
                      }
                    } else {
                      // Fix a bug for some users of v4.8.0
                      let authKey = push.key
                      if (push.key?.length <= 10) {
                        authKey = fromByteArray(Crypto.getRandomBytes(16))
                      }
                      // Turning on
                      const randomPath = (Math.random() + 1).toString(36).substring(2)

                      const endpoint = `https://${TOOOT_API_DOMAIN}/push/send/${pushPath}/${randomPath}`

                      const body: {
                        subscription: any
                        data: { alerts: Mastodon.PushSubscription['alerts'] }
                      } = {
                        subscription: {
                          endpoint,
                          keys: {
                            p256dh:
                              'BMn2PLpZrMefG981elzG6SB1EY9gU7QZwmtZ/a/J2vUeWG+zXgeskMPwHh4T/bxsD4l7/8QT94F57CbZqYRRfJo=',
                            auth: authKey
                          }
                        },
                        data: { alerts: push.alerts }
                      }

                      const res = await apiInstance<Mastodon.PushSubscription>({
                        method: 'post',
                        url: 'push/subscription',
                        body
                      })

                      if (!res.body.server_key?.length) {
                        displayMessage({
                          type: 'danger',
                          duration: 'long',
                          message: t('me.push.missingServerKey.message'),
                          description: t('me.push.missingServerKey.description')
                        })
                        await apiInstance({
                          method: 'delete',
                          url: 'push/subscription'
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
                          auth: push.decode === false ? null : authKey
                        }
                      }).catch(async () => {
                        await apiInstance({
                          method: 'delete',
                          url: 'push/subscription'
                        })
                        return Promise.reject()
                      })

                      setAccountStorage([
                        { key: 'push', value: { ...push, global: true, key: authKey } }
                      ])
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
                  iconBack='external-link'
                  onPress={async () => openLink('https://tooot.app/how-push-works')}
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
              <Icon name='frown' size={StyleConstants.Font.Size.L} color={colors.primaryDefault} />
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
          <Icon name='frown' size={StyleConstants.Font.Size.L} color={colors.primaryDefault} />
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
  ) : (
    <Loading style={{ flex: 1 }} />
  )
}

export default TabMePush
