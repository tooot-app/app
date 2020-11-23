import React, { useCallback, useEffect, useState } from 'react'
import { Button, StyleSheet, Text, TextInput, View } from 'react-native'
import { useQuery } from 'react-query'
import { debounce } from 'lodash'

import { instanceFetch } from 'src/utils/fetches/instanceFetch'
import client from 'src/api/client'
import * as AuthSession from 'expo-auth-session'
import { useDispatch } from 'react-redux'
import { updateLocal } from 'src/utils/slices/instancesSlice'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from 'src/utils/styles/ThemeManager'

import constants from 'src/utils/styles/constants'

const Login: React.FC = () => {
  const { theme } = useTheme()
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
        navigation.navigate('Screen-Local-Root')
      }
    })()
  }, [response])

  return (
    <View style={styles.base}>
      <TextInput
        style={{
          height: 50,
          color: theme.primary,
          borderColor: theme.border,
          borderWidth: 1,
          padding: constants.SPACING_M
        }}
        onChangeText={onChangeText}
        autoCapitalize='none'
        autoCorrect={false}
        autoFocus
        clearButtonMode='unless-editing'
        keyboardType='url'
        textContentType='URL'
        onSubmitEditing={async () =>
          isSuccess && data && data.uri && (await createApplication())
        }
        placeholder='输入服务器'
        placeholderTextColor={theme.secondary}
        returnKeyType='go'
      />
      <Button
        title='登录'
        disabled={!data?.uri}
        onPress={async () => await createApplication()}
      />
      {isSuccess && data && data.uri && (
        <View>
          <Text style={{ color: theme.primary }}>{data.title}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    padding: constants.GLOBAL_PAGE_PADDING
  }
})

export default Login
