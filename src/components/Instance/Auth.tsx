import { useNavigation } from '@react-navigation/native'
import { useAppDispatch } from '@root/store'
import { InstanceLatest } from '@utils/migrations/instances/migration'
import { TabMeStackNavigationProp } from '@utils/navigation/navigators'
import addInstance from '@utils/slices/instances/add'
import { checkInstanceFeature } from '@utils/slices/instancesSlice'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import React, { useEffect } from 'react'
import { Platform } from 'react-native'
import { useQueryClient } from 'react-query'
import { useSelector } from 'react-redux'

export interface Props {
  instanceDomain: string
  // Domain can be different than uri
  instance: Mastodon.Instance
  appData: InstanceLatest['appData']
  goBack?: boolean
}

const InstanceAuth = React.memo(
  ({ instanceDomain, instance, appData, goBack }: Props) => {
    const redirectUri = AuthSession.makeRedirectUri({
      native: 'tooot://instance-auth',
      useProxy: false
    })

    const navigation = useNavigation<TabMeStackNavigationProp<'Tab-Me-Root' | 'Tab-Me-Switch'>>()
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

    const deprecateAuthFollow = useSelector(checkInstanceFeature('deprecate_auth_follow'))
    const [request, response, promptAsync] = AuthSession.useAuthRequest(
      {
        clientId: appData.clientId,
        clientSecret: appData.clientSecret,
        scopes: deprecateAuthFollow
          ? ['read', 'write', 'push']
          : ['read', 'write', 'follow', 'push'],
        redirectUri
      },
      {
        authorizationEndpoint: `https://${instanceDomain}/oauth/authorize`
      }
    )
    useEffect(() => {
      ;(async () => {
        if (request?.clientId) {
          let browserPackage: string | undefined
          if (Platform.OS === 'android') {
            const tabsSupportingBrowsers = await WebBrowser.getCustomTabsSupportingBrowsersAsync()
            browserPackage =
              tabsSupportingBrowsers?.preferredBrowserPackage ||
              tabsSupportingBrowsers.browserPackages[0] ||
              tabsSupportingBrowsers.servicePackages[0]
          }
          await promptAsync({ browserPackage }).catch(e => console.log(e))
        }
      })()
    }, [request])
    useEffect(() => {
      ;(async () => {
        if (response?.type === 'success') {
          const { accessToken } = await AuthSession.exchangeCodeAsync(
            {
              clientId: appData.clientId,
              clientSecret: appData.clientSecret,
              scopes: ['read', 'write', 'follow', 'push'],
              redirectUri,
              code: response.params.code,
              extraParams: {
                grant_type: 'authorization_code'
              }
            },
            {
              tokenEndpoint: `https://${instanceDomain}/oauth/token`
            }
          )
          queryClient.clear()
          dispatch(
            addInstance({
              domain: instanceDomain,
              token: accessToken,
              instance,
              appData
            })
          )
          goBack && navigation.goBack()
        }
      })()
    }, [response])

    return <></>
  },
  () => true
)

export default InstanceAuth
