import React, { useCallback, useState } from 'react'
import { Button, Text, TextInput, View } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useQuery } from 'react-query'
import { debounce } from 'lodash'

import { instanceFetch } from 'src/stacks/common/instanceFetch'
import { ScreenMeAuthentication } from '../Authentication'
import client from 'src/api/client'
import * as AppAuth from 'expo-app-auth'

const Instance: React.FC = () => {
  const [instance, setInstance] = useState('')

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
        refetch()
      },
      1000,
      {
        leading: true
      }
    ),
    []
  )

  const signInAsync = async (id: string) => {
    let authState = await AppAuth.authAsync({
      issuer: `https://${instance}`,
      scopes: ['read', 'write', 'follow', 'push'],
      clientId: id,
      redirectUrl: 'exp://127.0.0.1:19000',
      serviceConfiguration: {
        authorizationEndpoint: `https://${instance}/oauth/authorize`,
        revocationEndpoint: `https://${instance}/oauth/revoke`,
        tokenEndpoint: `https://${instance}/oauth/token`
      },
      additionalParameters: {
        response_type: 'code'
      }
    })
    console.log(authState)
    return authState
  }

  const oauthCreateApplication = async () => {
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
      return Promise.resolve(res.body)
    } else {
      return Promise.reject()
    }
  }

  const oauthFlow = async () => {
    const applicationData = await oauthCreateApplication()
    if (applicationData.client_id.length > 0) {
      await signInAsync(applicationData.client_id)
    } else {
      console.error('Application data error')
    }
  }

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
        onPress={async () => await oauthFlow()}
      />
      {isSuccess && data && data.uri && (
        <View>
          <Text>{data.title}</Text>
        </View>
      )}
    </View>
  )
}

export default Instance
