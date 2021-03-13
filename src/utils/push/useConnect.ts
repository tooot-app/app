import apiGeneral from '@api/general'
import { displayMessage } from '@components/Message'
import { NavigationContainerRef } from '@react-navigation/native'
import { Dispatch } from '@reduxjs/toolkit'
import {
  disableAllPushes,
  Instance,
  PUSH_SERVER
} from '@utils/slices/instancesSlice'
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'
import { TFunction } from 'react-i18next'

export interface Params {
  navigationRef: React.RefObject<NavigationContainerRef>
  mode: 'light' | 'dark'
  t: TFunction<'common'>
  instances: Instance[]
  dispatch: Dispatch<any>
}

const pushUseConnect = ({
  navigationRef,
  mode,
  t,
  instances,
  dispatch
}: Params) => {
  return useEffect(() => {
    const connect = async () => {
      const expoToken = (
        await Notifications.getExpoPushTokenAsync({
          experienceId: '@xmflsct/tooot'
        })
      ).data

      apiGeneral({
        method: 'post',
        domain: PUSH_SERVER,
        url: 'v1/connect',
        body: {
          expoToken
        },
        sentry: true
      }).catch(error => {
        if (error.status == 410) {
          displayMessage({
            mode,
            type: 'error',
            duration: 'long',
            message: t('meSettingsPush:error.message'),
            description: t('meSettingsPush:error.description'),
            onPress: () => {
              navigationRef.current?.navigate('Screen-Tabs', {
                screen: 'Tab-Me',
                params: {
                  screen: 'Tab-Me-Root'
                }
              })
              navigationRef.current?.navigate('Screen-Tabs', {
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
