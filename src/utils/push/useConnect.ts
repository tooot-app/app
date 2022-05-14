import apiGeneral from '@api/general'
import apiTooot from '@api/tooot'
import { displayMessage } from '@components/Message'
import navigationRef from '@helpers/navigationRef'
import { useAppDispatch } from '@root/store'
import { isDevelopment } from '@utils/checkEnvironment'
import { disableAllPushes, Instance } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'
import { TFunction } from 'react-i18next'

export interface Params {
  t: TFunction<'screens'>
  instances: Instance[]
}

const pushUseConnect = ({ t, instances }: Params) => {
  const dispatch = useAppDispatch()
  const { theme } = useTheme()

  return useEffect(() => {
    const connect = async () => {
      const expoToken = isDevelopment
        ? 'DEVELOPMENT_TOKEN_1'
        : (
            await Notifications.getExpoPushTokenAsync({
              experienceId: '@xmflsct/tooot',
              applicationId: 'com.xmflsct.tooot.app'
            })
          ).data

      apiTooot({
        method: 'get',
        url: `push/connect/${expoToken}`,
        sentry: true
      }).catch(error => {
        if (error.status == 404) {
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
    if (pushEnabled.length) {
      connect()
    }
  }, [instances])
}

export default pushUseConnect
