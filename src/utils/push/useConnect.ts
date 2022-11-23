import apiGeneral from '@api/general'
import apiTooot from '@api/tooot'
import { displayMessage } from '@components/Message'
import navigationRef from '@helpers/navigationRef'
import { useAppDispatch } from '@root/store'
import * as Sentry from '@sentry/react-native'
import { getExpoToken, retrieveExpoToken } from '@utils/slices/appSlice'
import { disableAllPushes, getInstances } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState } from 'react-native'
import { useSelector } from 'react-redux'

const pushUseConnect = () => {
  const { t } = useTranslation('screens')
  const { theme } = useTheme()

  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(retrieveExpoToken())
  }, [])

  const expoToken = useSelector(getExpoToken)
  const instances = useSelector(getInstances, (prev, next) => prev.length === next.length)
  const pushEnabled = instances.filter(instance => instance.push.global.value)

  const connect = () => {
    apiTooot({
      method: 'get',
      url: `/push/connect/${expoToken}`
    })
      .then(() => Notifications.setBadgeCountAsync(0))
      .catch(error => {
        Sentry.setExtras({
          API: 'tooot',
          expoToken,
          ...(error?.response && { response: error.response })
        })
        Sentry.captureMessage('Push connect error', {
          contexts: { errorObject: error }
        })
        Notifications.setBadgeCountAsync(0)
        if (error?.status == 404) {
          displayMessage({
            theme,
            type: 'error',
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
            if (instance.push.global.value) {
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
      })
  }

  useEffect(() => {
    Sentry.setExtras({
      expoToken,
      pushEnabledCount: pushEnabled
    })

    if (expoToken && pushEnabled.length) {
      connect()
    }

    const appStateListener = AppState.addEventListener('change', state => {
      if (expoToken && pushEnabled.length && state === 'active') {
        Notifications.getBadgeCountAsync().then(count => {
          if (count > 0) {
            connect()
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
