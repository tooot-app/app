import apiGeneral from '@api/general'
import apiTooot from '@api/tooot'
import { displayMessage } from '@components/Message'
import navigationRef from '@helpers/navigationRef'
import { useAppDispatch } from '@root/store'
import * as Sentry from '@sentry/react-native'
import { useQuery } from '@tanstack/react-query'
import { disableAllPushes, getInstances } from '@utils/slices/instancesSlice'
import { useGlobalStorage } from '@utils/storage/actions'
import { AxiosError } from 'axios'
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState } from 'react-native'
import { useSelector } from 'react-redux'
import { updateExpoToken } from './updateExpoToken'

const pushUseConnect = () => {
  const { t } = useTranslation('screens')

  const dispatch = useAppDispatch()
  useEffect(() => {
    updateExpoToken()
  }, [])

  const [expoToken] = useGlobalStorage.string('app.expo_token')
  const instances = useSelector(getInstances, (prev, next) => prev.length === next.length)
  const pushEnabled = instances.filter(instance => instance.push.global)

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

          dispatch(disableAllPushes())

          instances.forEach(instance => {
            if (instance.push.global) {
              apiGeneral<{}>({
                method: 'delete',
                domain: instance.url,
                url: 'api/v1/push/subscription',
                headers: {
                  Authorization: `Bearer ${instance.token}`
                }
              }).catch(() => console.log('error!!!'))
            }
          })
        }
      }
    }
  )

  useEffect(() => {
    Sentry.setContext('Push', { expoToken, pushEnabledCount: pushEnabled.length })

    if (expoToken && pushEnabled.length) {
      connectQuery.refetch()
    }

    const appStateListener = AppState.addEventListener('change', state => {
      if (expoToken && pushEnabled.length && state === 'active') {
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
  }, [expoToken, pushEnabled.length])
}

export default pushUseConnect
