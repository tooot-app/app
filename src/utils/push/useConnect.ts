import apiGeneral from '@api/general'
import apiTooot from '@api/tooot'
import { displayMessage } from '@components/Message'
import navigationRef from '@helpers/navigationRef'
import { Dispatch } from '@reduxjs/toolkit'
import { isDevelopment } from '@utils/checkEnvironment'
import { disableAllPushes, Instance } from '@utils/slices/instancesSlice'
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'
import { TFunction } from 'react-i18next'

export interface Params {
  mode: 'light' | 'dark'
  t: TFunction<'screens'>
  instances: Instance[]
  dispatch: Dispatch<any>
}

const pushUseConnect = ({ mode, t, instances, dispatch }: Params) => {
  return useEffect(() => {
    const connect = async () => {
      const expoToken = isDevelopment
      ? 'DEVELOPMENT_TOKEN_1'
      : (
          await Notifications.getExpoPushTokenAsync({
            experienceId: '@xmflsct/tooot'
          })
        ).data

      apiTooot({
        method: 'get',
        url: `push/connect/${expoToken}`,
        sentry: true
      }).catch(error => {
        if (error.status == 404) {
          displayMessage({
            mode,
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
    if (pushEnabled.length) {
      connect()
    }
  }, [instances])
}

export default pushUseConnect
