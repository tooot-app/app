import { displayMessage } from '@components/Message'
import { getPushPath, getPushendpoint } from '@screens/Tabs/Me/Push'
import * as Sentry from '@sentry/react-native'
import { useQuery } from '@tanstack/react-query'
import apiGeneral from '@utils/api/general'
import apiInstance from '@utils/api/instance'
import apiTooot from '@utils/api/tooot'
import navigationRef from '@utils/navigation/navigationRef'
import {
  generateAccountKey,
  getAccountDetails,
  getGlobalStorage,
  setAccountStorage,
  setGlobalStorage,
  useGlobalStorage
} from '@utils/storage/actions'
import { AxiosError } from 'axios'
import * as Notifications from 'expo-notifications'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState } from 'react-native'
import { toRawExpoToken, updateExpoToken } from './updateExpoToken'

const pushUseConnect = () => {
  const { t } = useTranslation('screens')

  const startupChecked = useRef<boolean>(false)

  const [expoToken] = useGlobalStorage.string('app.expo_token')
  const accounts = getGlobalStorage.object('accounts')
  const pushEnabled = accounts
    ?.map(account => {
      const details = getAccountDetails(['push', 'auth.domain', 'auth.account.id'], account)
      if (details?.push?.global) {
        return {
          accountKey: generateAccountKey({
            domain: details['auth.domain'],
            id: details['auth.account.id']
          }),
          push: details.push,
          domain: details['auth.domain'],
          accountId: details['auth.account.id']
        }
      }
    })
    .filter(d => !!d)

  const connectQuery = useQuery<{ accounts: string[] } | undefined, AxiosError>(
    ['tooot', { endpoint: 'push/connect' }],
    () =>
      apiTooot<{ accounts: string[] } | undefined>({
        method: 'get',
        url: `push/connect/${expoToken}`
      }).then(res => res.body),
    {
      enabled: false,
      retry: (failureCount, error) => {
        if (error.status == 404) return false

        return failureCount < 10
      },
      retryOnMount: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      onSettled: () => Notifications.setBadgeCountAsync(0),
      onSuccess: data => {
        if (!startupChecked.current && data?.accounts) {
          startupChecked.current = true
          for (const acct of data.accounts) {
            const matchedAcct = pushEnabled?.find(p => p?.accountKey === acct)
            if (matchedAcct && !matchedAcct.push.global) {
              setAccountStorage([{ key: 'push', value: { ...matchedAcct.push, global: true } }])
            }
          }
        }
      },
      onError: error => {
        if (error?.status == 404) {
          displayMessage({
            type: 'danger',
            duration: 'long',
            message: t('pushError.message'),
            description: t('pushError.description'),
            onPress: () => {
              navigationRef.navigate('Screen-Tabs', {
                screen: 'Tab-Me',
                params: {
                  screen: 'Tab-Me-Root'
                }
              })
              navigationRef.navigate('Screen-Tabs', {
                screen: 'Tab-Me',
                params: {
                  screen: 'Tab-Me-Settings'
                }
              })
            }
          })

          getGlobalStorage.object('accounts')?.forEach(account => {
            const accountDetails = getAccountDetails(['push', 'auth.domain', 'auth.token'], account)
            if (!accountDetails) return

            if (accountDetails.push.global) {
              apiGeneral<{}>({
                method: 'delete',
                domain: accountDetails['auth.domain'],
                url: 'api/v1/push/subscription',
                headers: {
                  Authorization: `Bearer ${accountDetails['auth.token']}`
                }
              }).catch(() => console.log('error!!!'))
            }
            setAccountStorage(
              [{ key: 'push', value: { ...accountDetails?.push, global: false } }],
              account
            )
          })
        }
      }
    }
  )

  useEffect(() => {
    updateExpoToken().then(async token => {
      const badgeCount = await Notifications.getBadgeCountAsync()
      if (token && !token.startsWith('ExponentPushToken') && (pushEnabled?.length || badgeCount)) {
        connectQuery.refetch()
      }

      if (expoToken?.startsWith('ExponentPushToken')) {
        const newToken = toRawExpoToken(expoToken)

        if (pushEnabled) {
          for (const account of pushEnabled) {
            if (account) {
              const oldSub = await apiInstance<Mastodon.PushSubscription>({
                account: account.accountKey,
                method: 'get',
                url: 'push/subscription'
              })
              if (oldSub.body.id) {
                const body: {
                  subscription: any
                  data: { alerts: Mastodon.PushSubscription['alerts'] }
                } = {
                  subscription: {
                    endpoint: getPushendpoint(
                      getPushPath({
                        expoToken: newToken,
                        domain: account.domain,
                        accountId: account.accountId
                      })
                    ),
                    keys: {
                      p256dh:
                        'BMn2PLpZrMefG981elzG6SB1EY9gU7QZwmtZ/a/J2vUeWG+zXgeskMPwHh4T/bxsD4l7/8QT94F57CbZqYRRfJo=',
                      auth: account.push.key
                    }
                  },
                  data: { alerts: account.push.alerts }
                }
                console.log(body)
                await apiInstance({
                  account: account?.accountKey,
                  method: 'post',
                  url: 'push/subscription',
                  body
                })
              }
            }
          }
        } else {
          setGlobalStorage('app.expo_token', newToken)
        }

        await apiTooot({ method: 'post', url: `push/migrate/${expoToken}` })
      }
    })
  }, [])

  useEffect(() => {
    Sentry.setTags({ expoToken, pushEnabledCount: pushEnabled?.length })

    const appStateListener = AppState.addEventListener('change', state => {
      if (expoToken && pushEnabled?.length && state === 'active') {
        Notifications.getBadgeCountAsync().then(count => {
          if (count > 0) connectQuery.refetch()
        })
      }
    })

    return () => {
      appStateListener.remove()
    }
  }, [expoToken, pushEnabled?.length])
}

export default pushUseConnect
