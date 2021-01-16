import { useNavigation } from '@react-navigation/native'
import { InstanceLocal, localAddInstance } from '@utils/slices/instancesSlice'
import * as AuthSession from 'expo-auth-session'
import Constants from 'expo-constants'
import React, { useEffect } from 'react'
import { useQueryClient } from 'react-query'
import { useDispatch } from 'react-redux'

export interface Props {
  instanceDomain: string
  appData: InstanceLocal['appData']
  goBack?: boolean
}

const InstanceAuth = React.memo(
  ({ instanceDomain, appData, goBack }: Props) => {
    let redirectUri: string
    switch (Constants.manifest.releaseChannel) {
      case 'production':
      case 'staging':
      case 'testing':
        redirectUri = 'tooot://expo-auth-session'
        break
      default:
        redirectUri = 'exp://127.0.0.1:19000'
        break
    }
    const navigation = useNavigation()
    const queryClient = useQueryClient()
    const dispatch = useDispatch()

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
      {
        clientId: appData.clientId,
        clientSecret: appData.clientSecret,
        scopes: ['read', 'write', 'follow', 'push'],
        redirectUri
      },
      {
        authorizationEndpoint: `https://${instanceDomain}/oauth/authorize`
      }
    )
    useEffect(() => {
      ;(async () => {
        if (request?.clientId) {
          await promptAsync()
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
            localAddInstance({
              url: instanceDomain,
              token: accessToken,
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
