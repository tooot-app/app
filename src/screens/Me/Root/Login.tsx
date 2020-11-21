import React, { useCallback, useEffect, useState } from 'react'
import { Button, Text, TextInput, View } from 'react-native'
import { useQuery } from 'react-query'
import { debounce } from 'lodash'

import { instanceFetch } from 'src/utils/fetches/instanceFetch'
import client from 'src/api/client'
import * as AuthSession from 'expo-auth-session'
import { useDispatch } from 'react-redux'
import { updateLocal } from 'src/utils/slices/instancesSlice'
import { useNavigation } from '@react-navigation/native'

const Login: React.FC = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const [instance, setInstance] = useState('')
  const [applicationData, setApplicationData] = useState<{
    clientId: string
    clientSecret: string
  }>()

  const { isSuccess, refetch, data } = useQuery(
    ['Instance', { instance }],
    instanceFetch,
    {
      enabled: false,
      retry: false
    }
  )

  const onChangeText = useCallback(
    debounce(
      text => {
        setInstance(text)
        setApplicationData(undefined)
        refetch()
      },
      1000,
      {
        leading: true
      }
    ),
    []
  )

  const createApplication = async () => {
    if (applicationData) {
      return Promise.resolve()
    }
    const formData = new FormData()
    formData.append('client_name', 'test_dudu')
    formData.append('redirect_uris', 'exp://127.0.0.1:19000')
    formData.append('scopes', 'read write follow push')

    const res = await client({
      method: 'post',
      instance: 'remote',
      instanceUrl: instance,
      endpoint: `apps`,
      body: formData
    })
    if (res.body?.client_id.length > 0) {
      setApplicationData({
        clientId: res.body.client_id,
        clientSecret: res.body.client_secret
      })
      return Promise.resolve()
    } else {
      return Promise.reject()
    }
  }

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: applicationData?.clientId!,
      clientSecret: applicationData?.clientSecret,
      scopes: ['read', 'write', 'follow', 'push'],
      redirectUri: 'exp://127.0.0.1:19000'
    },
    {
      authorizationEndpoint: `https://${instance}/oauth/authorize`
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
            clientId: applicationData?.clientId!,
            clientSecret: applicationData?.clientSecret,
            scopes: ['read', 'write', 'follow', 'push'],
            redirectUri: 'exp://127.0.0.1:19000',
            code: response.params.code,
            extraParams: {
              grant_type: 'authorization_code'
            }
          },
          {
            tokenEndpoint: `https://${instance}/oauth/token`
          }
        )
        dispatch(updateLocal({ url: instance, token: accessToken }))
        navigation.navigate('Local')
      }
    })()
  }, [response])

  return (
    <View>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
        onChangeText={onChangeText}
        autoCapitalize='none'
        autoCorrect={false}
        clearButtonMode='unless-editing'
        keyboardType='url'
        textContentType='URL'
        placeholder='输入服务器'
        placeholderTextColor='#888888'
      />
      <Button
        title='登录'
        disabled={!data?.uri}
        onPress={async () => await createApplication()}
      />
      {isSuccess && data && data.uri && (
        <View>
          <Text>{data.title}</Text>
        </View>
      )}
    </View>
  )
}

export default Login
