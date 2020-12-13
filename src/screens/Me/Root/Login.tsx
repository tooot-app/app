import React, {
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import {
  Animated,
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
import client from '@api/client'
import * as AuthSession from 'expo-auth-session'
import { useDispatch } from 'react-redux'
import { updateLocal } from '@utils/slices/instancesSlice'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '@utils/styles/ThemeManager'

import { useTranslation } from 'react-i18next'
import { StyleConstants } from '@utils/styles/constants'
import { ButtonRow } from '@components/Button'
import ParseContent from '@root/components/ParseContent'
import ShimmerPlaceholder from 'react-native-shimmer-placeholder'
import { Feather } from '@expo/vector-icons'

const Login: React.FC = () => {
  const { t } = useTranslation('meRoot')
  const { theme } = useTheme()
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const [instance, setInstance] = useState('')
  const [applicationData, setApplicationData] = useState<{
    clientId: string
    clientSecret: string
  }>()

  const { isSuccess, isFetching, refetch, data } = useQuery(
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
        if (text) {
          refetch()
        }
      },
      1000,
      {
        trailing: true
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
      instanceDomain: instance,
      url: `apps`,
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

  const infoRef = createRef<ShimmerPlaceholder>()

  const instanceInfo = useCallback(
    ({
      header,
      content,
      parse
    }: {
      header: string
      content: string
      parse?: boolean
    }) => {
      if (isFetching) {
        Animated.loop(infoRef.current?.getAnimated()!).start()
      }

      return (
        <View style={styles.instanceInfo}>
          <Text style={[styles.instanceInfoHeader, { color: theme.primary }]}>
            {header}
          </Text>
          <ShimmerPlaceholder
            visible={data?.uri}
            stopAutoRun
            width={
              Dimensions.get('screen').width -
              StyleConstants.Spacing.Global.PagePadding * 4
            }
            height={StyleConstants.Font.Size.M}
          >
            <Text
              style={[styles.instanceInfoContent, { color: theme.primary }]}
            >
              {parse ? (
                <ParseContent content={content} size={'M'} numberOfLines={5} />
              ) : (
                content
              )}
            </Text>
          </ShimmerPlaceholder>
        </View>
      )
    },
    [data?.uri, isFetching]
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
            autoFocus
            clearButtonMode='unless-editing'
            keyboardType='url'
            textContentType='URL'
            onSubmitEditing={async () =>
              isSuccess && data && data.uri && (await createApplication())
            }
            placeholder={t('content.login.server.placeholder')}
            placeholderTextColor={theme.secondary}
            returnKeyType='go'
          />
          <ButtonRow
            onPress={async () => await createApplication()}
            {...(isFetching
              ? { icon: 'loader' }
              : { text: t('content.login.button') as string })}
            disabled={!data?.uri}
          />
        </View>
        <View>
          {instanceInfo({ header: '实例名称', content: data?.title })}
          {instanceInfo({
            header: '实例介绍',
            content: data?.short_description,
            parse: true
          })}
          <View style={styles.instanceStats}>
            <View style={styles.instanceStat}>
              <Text
                style={[styles.instanceInfoHeader, { color: theme.primary }]}
              >
                用户总数
              </Text>
              <ShimmerPlaceholder
                visible={data?.stats?.user_count}
                stopAutoRun
                width={StyleConstants.Font.Size.M * 4}
                height={StyleConstants.Font.Size.M}
              >
                <Text
                  style={[styles.instanceInfoContent, { color: theme.primary }]}
                >
                  {data?.stats?.user_count}
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
                visible={data?.stats?.user_count}
                stopAutoRun
                width={StyleConstants.Font.Size.M * 4}
                height={StyleConstants.Font.Size.M}
              >
                <Text
                  style={[styles.instanceInfoContent, { color: theme.primary }]}
                >
                  {data?.stats?.status_count}
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
                visible={data?.stats?.user_count}
                stopAutoRun
                width={StyleConstants.Font.Size.M * 4}
                height={StyleConstants.Font.Size.M}
              >
                <Text
                  style={[styles.instanceInfoContent, { color: theme.primary }]}
                >
                  {data?.stats?.domain_count}
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
    flex: 1,
    flexDirection: 'row'
  },
  textInput: {
    flex: 1,
    borderBottomWidth: 1.25,
    paddingTop: StyleConstants.Spacing.S - 1.5,
    paddingBottom: StyleConstants.Spacing.S - 1.5,
    paddingLeft: StyleConstants.Spacing.Global.PagePadding,
    paddingRight: StyleConstants.Spacing.Global.PagePadding,
    fontSize: StyleConstants.Font.Size.M,
    marginRight: StyleConstants.Spacing.M
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
