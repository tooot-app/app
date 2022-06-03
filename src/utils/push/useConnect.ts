import apiGeneral from '@api/general'
import apiTooot from '@api/tooot'
import { displayMessage } from '@components/Message'
import navigationRef from '@helpers/navigationRef'
import { useAppDispatch } from '@root/store'
import { InstanceLatest } from '@utils/migrations/instances/migration'
import { getExpoToken, retriveExpoToken } from '@utils/slices/appSlice'
import { disableAllPushes } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'
import { TFunction } from 'react-i18next'
import { AppState } from 'react-native'
import { useSelector } from 'react-redux'

export interface Params {
  t: TFunction<'screens'>
  instances: InstanceLatest[]
}

const pushUseConnect = ({ t, instances }: Params) => {
  const dispatch = useAppDispatch()
  const { theme } = useTheme()
  useEffect(() => {
    dispatch(retriveExpoToken())
  }, [])

  const expoToken = useSelector(getExpoToken)

  const connect = () => {
    apiTooot({
      method: 'get',
      url: `push/connect/${expoToken}`,
      sentry: true
    }).catch(error => {
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

  const pushEnabled = instances.filter(instance => instance.push.global.value)

  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', state => {
      console.log('changing state to', state)
      if (expoToken && pushEnabled.length && state === 'active') {
        Notifications.getBadgeCountAsync().then(count => {
          if (count > 0) {
            Notifications.setBadgeCountAsync(0)
            connect()
          }
        })
      }
    })

    return () => {
      appStateListener.remove()
    }
  }, [expoToken, pushEnabled.length])

  return useEffect(() => {
    if (expoToken && pushEnabled.length) {
      connect()
    }
  }, [expoToken, pushEnabled.length])
}

export default pushUseConnect
