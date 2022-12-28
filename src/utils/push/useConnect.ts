import { displayMessage } from '@components/Message'
import * as Sentry from '@sentry/react-native'
import { useQuery } from '@tanstack/react-query'
import apiGeneral from '@utils/api/general'
import apiTooot from '@utils/api/tooot'
import navigationRef from '@utils/navigation/navigationRef'
import {
    getAccountDetails,
    getGlobalStorage,
    setAccountDetails,
    useGlobalStorage
} from '@utils/storage/actions'
import { AxiosError } from 'axios'
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState } from 'react-native'
import { updateExpoToken } from './updateExpoToken'

const pushUseConnect = () => {
  const { t } = useTranslation('screens')

  useEffect(() => {
    updateExpoToken()
  }, [])

  const [expoToken] = useGlobalStorage.string('app.expo_token')
  const pushEnabledCount = getGlobalStorage.object('accounts').filter(account => {
    return getAccountDetails(['push'], account)?.push.global
  }).length

  const connectQuery = useQuery<any, AxiosError>(
    ['tooot', { endpoint: 'push/connect' }],
    () =>
      apiTooot<Mastodon.Status>({
        method: 'get',
        url: `push/connect/${expoToken}`
      }),
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

          getGlobalStorage.object('accounts').forEach(account => {
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
            setAccountDetails('push', { ...accountDetails?.push, global: false }, account)
          })
        }
      }
    }
  )

  useEffect(() => {
    Sentry.setContext('Push', { expoToken, pushEnabledCount })

    if (expoToken && pushEnabledCount) {
      connectQuery.refetch()
    }

    const appStateListener = AppState.addEventListener('change', state => {
      if (expoToken && pushEnabledCount && state === 'active') {
        Notifications.getBadgeCountAsync().then(count => {
          if (count > 0) {
            connectQuery.refetch()
          }
        })
      }
    })

    return () => {
      appStateListener.remove()
    }
  }, [expoToken, pushEnabledCount])
}

export default pushUseConnect
