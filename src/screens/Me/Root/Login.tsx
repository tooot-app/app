import React, { useCallback, useEffect, useState } from 'react'
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { useQuery } from 'react-query'
import { debounce } from 'lodash'

import { instanceFetch } from '@utils/fetches/instanceFetch'
import * as AuthSession from 'expo-auth-session'
import { useDispatch } from 'react-redux'
import { loginLocal } from '@utils/slices/instancesSlice'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '@utils/styles/ThemeManager'

import { useTranslation } from 'react-i18next'
import { StyleConstants } from '@utils/styles/constants'
import Button from '@components/Button'
import ParseContent from '@root/components/ParseContent'
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
import { Feather } from '@expo/vector-icons'
import { applicationFetch } from '@root/utils/fetches/applicationFetch'
import { LinearGradient } from 'expo-linear-gradient'

const Login: React.FC = () => {
  const { t } = useTranslation('meRoot')
  const { theme } = useTheme()
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const [instanceDomain, setInstanceDomain] = useState<string | undefined>()
  const [applicationData, setApplicationData] = useState<{
    clientId: string
    clientSecret: string
  }>()

  const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)

  const instanceQuery = useQuery(
    ['Instance', { instanceDomain }],
    instanceFetch,
    { enabled: false, retry: false }
  )
  const applicationQuery = useQuery(
    ['Application', { instanceDomain }],
    applicationFetch,
    { enabled: false, retry: false }
  )

  useEffect(() => {
    if (
      applicationQuery.data?.client_id.length &&
      applicationQuery.data?.client_secret.length
    ) {
      setApplicationData({
        clientId: applicationQuery.data.client_id,
        clientSecret: applicationQuery.data.client_secret
      })
    }
  }, [applicationQuery.data?.client_id])

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: applicationData?.clientId!,
      clientSecret: applicationData?.clientSecret,
      scopes: ['read', 'write', 'follow', 'push'],
      redirectUri: 'exp://127.0.0.1:19000'
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
            tokenEndpoint: `https://${instanceDomain}/oauth/token`
          }
        )
        dispatch(loginLocal({ url: instanceDomain, token: accessToken }))
        navigation.navigate('Screen-Local')
      }
    })()
  }, [response])

  const onChangeText = useCallback(
    debounce(
      text => {
        setInstanceDomain(text.replace(/^http(s)?\:\/\//i, ''))
        setApplicationData(undefined)
      },
      1000,
      {
        trailing: true
      }
    ),
    []
  )
  useEffect(() => {
    if (instanceDomain) {
      instanceQuery.refetch()
    }
  }, [instanceDomain])

  const instanceInfo = useCallback(
    ({ header, content }: { header: string; content?: string }) => {
      return (
        <View style={styles.instanceInfo}>
          <Text style={[styles.instanceInfoHeader, { color: theme.primary }]}>
            {header}
          </Text>
          <ShimmerPlaceholder
            visible={instanceQuery.data?.uri !== undefined}
            stopAutoRun
            width={
              Dimensions.get('screen').width -
              StyleConstants.Spacing.Global.PagePadding * 4
            }
            height={StyleConstants.Font.Size.M}
          >
            <ParseContent content={content!} size={'M'} numberOfLines={5} />
          </ShimmerPlaceholder>
        </View>
      )
    },
    [instanceQuery.data?.uri]
  )

  return (
    <>
      <View style={{ flexDirection: 'row' }}>
        <Image
          source={require('assets/screens/meRoot/welcome.png')}
          style={{ resizeMode: 'contain', flex: 1, aspectRatio: 16 / 9 }}
        />
      </View>
      <View style={styles.base}>
        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.textInput,
              {
                color: theme.primary,
                borderBottomColor: theme.secondary
              }
            ]}
            onChangeText={onChangeText}
            autoCapitalize='none'
            autoCorrect={false}
            clearButtonMode='never'
            keyboardType='url'
            textContentType='URL'
            onSubmitEditing={({ nativeEvent: { text } }) => {
              if (
                text === instanceDomain &&
                instanceQuery.isSuccess &&
                instanceQuery.data &&
                instanceQuery.data.uri
              ) {
                applicationQuery.refetch()
              } else {
                setInstanceDomain(text)
                setApplicationData(undefined)
              }
            }}
            placeholder={t('content.login.server.placeholder')}
            placeholderTextColor={theme.secondary}
            returnKeyType='go'
          />
          <Button
            type='text'
            content={t('content.login.button')}
            onPress={() => applicationQuery.refetch()}
            disabled={!instanceQuery.data?.uri}
            loading={instanceQuery.isFetching || applicationQuery.isFetching}
          />
        </View>
        <View>
          {instanceInfo({
            header: '实例名称',
            content: instanceQuery.data?.title
          })}
          {instanceInfo({
            header: '实例介绍',
            content: instanceQuery.data?.short_description
          })}
          <View style={styles.instanceStats}>
            <View style={styles.instanceStat}>
              <Text
                style={[styles.instanceInfoHeader, { color: theme.primary }]}
              >
                用户总数
              </Text>
              <ShimmerPlaceholder
                visible={instanceQuery.data?.stats?.user_count !== undefined}
                stopAutoRun
                width={StyleConstants.Font.Size.M * 4}
                height={StyleConstants.Font.Size.M}
              >
                <Text
                  style={[styles.instanceInfoContent, { color: theme.primary }]}
                >
                  {instanceQuery.data?.stats?.user_count}
                </Text>
              </ShimmerPlaceholder>
            </View>
            <View style={[styles.instanceStat, { alignItems: 'center' }]}>
              <Text
                style={[styles.instanceInfoHeader, { color: theme.primary }]}
              >
                嘟嘟总数
              </Text>
              <ShimmerPlaceholder
                visible={instanceQuery.data?.stats?.user_count !== undefined}
                stopAutoRun
                width={StyleConstants.Font.Size.M * 4}
                height={StyleConstants.Font.Size.M}
              >
                <Text
                  style={[styles.instanceInfoContent, { color: theme.primary }]}
                >
                  {instanceQuery.data?.stats?.status_count}
                </Text>
              </ShimmerPlaceholder>
            </View>
            <View style={[styles.instanceStat, { alignItems: 'flex-end' }]}>
              <Text
                style={[styles.instanceInfoHeader, { color: theme.primary }]}
              >
                连结总数
              </Text>
              <ShimmerPlaceholder
                visible={instanceQuery.data?.stats?.user_count !== undefined}
                stopAutoRun
                width={StyleConstants.Font.Size.M * 4}
                height={StyleConstants.Font.Size.M}
              >
                <Text
                  style={[styles.instanceInfoContent, { color: theme.primary }]}
                >
                  {instanceQuery.data?.stats?.domain_count}
                </Text>
              </ShimmerPlaceholder>
            </View>
          </View>
          <Text style={[styles.disclaimer, { color: theme.secondary }]}>
            <Feather
              name='lock'
              size={StyleConstants.Font.Size.M}
              color={theme.secondary}
            />{' '}
            本站不留存任何信息
          </Text>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  base: {
    padding: StyleConstants.Spacing.Global.PagePadding
  },
  inputRow: {
    flexDirection: 'row'
  },
  textInput: {
    flex: 1,
    borderBottomWidth: 1,
    paddingLeft: StyleConstants.Spacing.Global.PagePadding,
    paddingRight: StyleConstants.Spacing.Global.PagePadding,
    fontSize: StyleConstants.Font.Size.M,
    marginRight: StyleConstants.Spacing.S
  },
  instanceInfo: {
    marginTop: StyleConstants.Spacing.M,
    paddingLeft: StyleConstants.Spacing.Global.PagePadding,
    paddingRight: StyleConstants.Spacing.Global.PagePadding
  },
  instanceInfoHeader: {
    fontSize: StyleConstants.Font.Size.S,
    fontWeight: StyleConstants.Font.Weight.Bold,
    marginBottom: StyleConstants.Spacing.XS
  },
  instanceInfoContent: { fontSize: StyleConstants.Font.Size.M },
  instanceStats: {
    flex: 1,
    flexDirection: 'row',
    marginTop: StyleConstants.Spacing.M,
    paddingLeft: StyleConstants.Spacing.Global.PagePadding,
    paddingRight: StyleConstants.Spacing.Global.PagePadding,
    marginBottom: StyleConstants.Spacing.M
  },
  instanceStat: {
    flex: 1
  },
  disclaimer: {
    fontSize: StyleConstants.Font.Size.S,
    paddingLeft: StyleConstants.Spacing.Global.PagePadding,
    paddingRight: StyleConstants.Spacing.Global.PagePadding,
    marginBottom: StyleConstants.Spacing.M
  }
})

export default Login
