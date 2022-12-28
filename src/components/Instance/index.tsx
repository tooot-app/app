import Button from '@components/Button'
import Icon from '@components/Icon'
import browserPackage from '@helpers/browserPackage'
import { redirectUri, useAppsMutation } from '@utils/queryHooks/apps'
import { useInstanceQuery } from '@utils/queryHooks/instance'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as AuthSession from 'expo-auth-session'
import * as Random from 'expo-random'
import * as WebBrowser from 'expo-web-browser'
import { debounce } from 'lodash'
import React, { RefObject, useCallback, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Alert, Image, KeyboardAvoidingView, Platform, TextInput, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import validUrl from 'valid-url'
import CustomText from '../Text'
import { useNavigation } from '@react-navigation/native'
import { TabMeStackNavigationProp } from '@utils/navigation/navigators'
import queryClient from '@helpers/queryClient'
import { featureCheck } from '@helpers/featureCheck'
import { generateAccountKey, getGlobalStorage, setAccountDetails } from '@utils/storage/actions'
import apiGeneral from '@api/general'
import { StorageAccount } from '@utils/storage/versions/account'
import base64 from 'react-native-base64'

export interface Props {
  scrollViewRef?: RefObject<ScrollView>
  disableHeaderImage?: boolean
  goBack?: boolean
}

const ComponentInstance: React.FC<Props> = ({
  scrollViewRef,
  disableHeaderImage,
  goBack = false
}) => {
  const { t } = useTranslation(['common', 'componentInstance'])
  const { colors, mode } = useTheme()
  const navigation = useNavigation<TabMeStackNavigationProp<'Tab-Me-Root' | 'Tab-Me-Switch'>>()

  const [domain, setDomain] = useState<string>('')
  const [errorCode, setErrorCode] = useState<number | null>(null)
  const whitelisted: boolean =
    !!domain.length &&
    !!errorCode &&
    !!validUrl.isHttpsUri(`https://${domain}`) &&
    errorCode === 401

  const instanceQuery = useInstanceQuery({
    domain,
    options: {
      enabled: !!domain,
      retry: false,
      onError: err => {
        if (err.status) {
          setErrorCode(err.status)
        }
      }
    }
  })

  const deprecateAuthFollow = featureCheck('deprecate_auth_follow')

  const appsMutation = useAppsMutation({
    retry: false,
    onSuccess: async (data, variables) => {
      const clientId = data.client_id
      const clientSecret = data.client_secret

      const discovery = { authorizationEndpoint: `https://${domain}/oauth/authorize` }

      const request = new AuthSession.AuthRequest({
        clientId,
        clientSecret,
        scopes: deprecateAuthFollow
          ? ['read', 'write', 'push']
          : ['read', 'write', 'follow', 'push'],
        redirectUri
      })
      await request.makeAuthUrlAsync(discovery)

      const promptResult = await request.promptAsync(discovery)

      if (promptResult?.type === 'success') {
        const { accessToken } = await AuthSession.exchangeCodeAsync(
          {
            clientId,
            clientSecret,
            scopes: ['read', 'write', 'follow', 'push'],
            redirectUri,
            code: promptResult.params.code,
            extraParams: { grant_type: 'authorization_code' }
          },
          { tokenEndpoint: `https://${variables.domain}/oauth/token` }
        )
        queryClient.clear()

        const {
          body: { id, acct, avatar_static }
        } = await apiGeneral<Mastodon.Account>({
          method: 'get',
          domain,
          url: `api/v1/accounts/verify_credentials`,
          headers: { Authorization: `Bearer ${accessToken}` }
        })

        const accounts = getGlobalStorage.object('accounts')
        const accountKey = generateAccountKey({ domain, id })
        const account = accounts.find(account => account === accountKey) || accountKey

        const accountDetails: StorageAccount = {
          'auth.clientId': clientId,
          'auth.clientSecret': clientSecret,
          'auth.token': accessToken,
          'auth.domain': domain,
          'auth.account.id': id,
          'auth.account.acct': acct,
          'auth.account.avatar_static': avatar_static,
          version: instanceQuery.data?.version || '0',
          preferences: undefined,
          notifications: {
            follow: true,
            follow_request: true,
            favourite: true,
            reblog: true,
            mention: true,
            poll: true,
            status: true,
            update: true,
            'admin.sign_up': true,
            'admin.report': true
          },
          push: {
            global: false,
            decode: false,
            alerts: {
              follow: true,
              follow_request: true,
              favourite: true,
              reblog: true,
              mention: true,
              poll: true,
              status: true,
              update: true,
              'admin.sign_up': false,
              'admin.report': false
            },
            key: base64.encodeFromByteArray(Random.getRandomBytes(16))
          },
          page_local: {
            showBoosts: true,
            showReplies: true
          },
          page_me: {
            followedTags: { shown: false },
            lists: { shown: false },
            announcements: { shown: false, unread: 0 }
          },
          drafts: [],
          emojis_frequent: []
        }
        let key: keyof typeof accountDetails
        for (key in accountDetails) {
          setAccountDetails(key, accountDetails[key], account)
        }

        goBack && navigation.goBack()
      }
    }
  })

  const processUpdate = useCallback(() => {
    if (domain) {
      const accounts = getGlobalStorage.object('accounts')
      if (accounts && accounts.filter(account => account.startsWith(`${domain}/`)).length) {
        Alert.alert(
          t('componentInstance:update.alert.title'),
          t('componentInstance:update.alert.message'),
          [
            {
              text: t('common:buttons.cancel'),
              style: 'cancel'
            },
            {
              text: t('common:buttons.continue'),
              onPress: () => appsMutation.mutate({ domain })
            }
          ]
        )
      } else {
        appsMutation.mutate({ domain })
      }
    }
  }, [domain])

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {!disableHeaderImage ? (
        <View style={{ flexDirection: 'row' }}>
          <Image
            source={require('assets/images/welcome.png')}
            style={{ resizeMode: 'contain', flex: 1, aspectRatio: 16 / 9 }}
          />
        </View>
      ) : null}
      <View
        style={{
          marginTop: StyleConstants.Spacing.L,
          marginHorizontal: StyleConstants.Spacing.Global.PagePadding
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: StyleConstants.Spacing.Global.PagePadding
          }}
        >
          <TextInput
            accessible={false}
            accessibilityRole='none'
            style={{
              borderBottomWidth: 1,
              ...StyleConstants.FontStyle.M,
              color: colors.primaryDefault,
              borderBottomColor: instanceQuery.isError
                ? whitelisted
                  ? colors.yellow
                  : colors.red
                : colors.border,
              ...(Platform.OS === 'android' && { paddingRight: 0 })
            }}
            editable={false}
            defaultValue='https://'
          />
          <TextInput
            style={{
              flex: 1,
              borderBottomWidth: 1,
              ...StyleConstants.FontStyle.M,
              marginRight: StyleConstants.Spacing.M,
              color: colors.primaryDefault,
              borderBottomColor: instanceQuery.isError
                ? whitelisted
                  ? colors.yellow
                  : colors.red
                : colors.border,
              ...(Platform.OS === 'android' && { paddingLeft: 0 })
            }}
            onChangeText={debounce(
              text => {
                setDomain(text.replace(/^http(s)?\:\/\//i, ''))
                setErrorCode(null)
              },
              1000,
              {
                trailing: true
              }
            )}
            autoCapitalize='none'
            clearButtonMode='never'
            keyboardType='url'
            textContentType='URL'
            onSubmitEditing={({ nativeEvent: { text } }) => {
              if (
                text === domain &&
                instanceQuery.isSuccess &&
                instanceQuery.data &&
                (instanceQuery.data.domain || instanceQuery.data.uri)
              ) {
                processUpdate()
              }
            }}
            placeholder={' ' + t('componentInstance:server.textInput.placeholder')}
            placeholderTextColor={colors.secondary}
            returnKeyType='go'
            keyboardAppearance={mode}
            {...(scrollViewRef && {
              onFocus: () =>
                setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }), 150)
            })}
            autoCorrect={false}
            spellCheck={false}
          />
          <Button
            type='text'
            content={t('componentInstance:server.button')}
            onPress={processUpdate}
            disabled={!(instanceQuery.data?.domain || instanceQuery.data?.uri) && !whitelisted}
            loading={instanceQuery.isFetching || appsMutation.isLoading}
          />
        </View>

        <View>
          {whitelisted ? (
            <CustomText
              fontStyle='S'
              style={{
                color: colors.yellow,
                paddingHorizontal: StyleConstants.Spacing.Global.PagePadding,
                paddingTop: StyleConstants.Spacing.XS
              }}
            >
              {t('componentInstance:server.whitelisted')}
            </CustomText>
          ) : null}
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: StyleConstants.Spacing.Global.PagePadding,
              marginTop: StyleConstants.Spacing.M
            }}
          >
            <Icon
              name='Lock'
              size={StyleConstants.Font.Size.S}
              color={colors.secondary}
              style={{
                marginTop: (StyleConstants.Font.LineHeight.S - StyleConstants.Font.Size.S) / 2,
                marginRight: StyleConstants.Spacing.XS
              }}
            />
            <CustomText fontStyle='S' style={{ flex: 1, color: colors.secondary }}>
              {t('componentInstance:server.disclaimer.base')}
            </CustomText>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: StyleConstants.Spacing.Global.PagePadding,
              marginBottom: StyleConstants.Spacing.M
            }}
          >
            <Icon
              name='CheckSquare'
              size={StyleConstants.Font.Size.S}
              color={colors.secondary}
              style={{
                marginTop: (StyleConstants.Font.LineHeight.S - StyleConstants.Font.Size.S) / 2,
                marginRight: StyleConstants.Spacing.XS
              }}
            />
            <CustomText
              fontStyle='S'
              style={{ flex: 1, color: colors.secondary }}
              accessibilityRole='link'
            >
              <Trans
                ns='componentInstance'
                i18nKey='server.terms.base'
                components={[
                  <CustomText
                    accessible
                    style={{ color: colors.blue }}
                    onPress={async () =>
                      WebBrowser.openBrowserAsync('https://tooot.app/privacy-policy', {
                        ...(await browserPackage())
                      })
                    }
                  />,
                  <CustomText
                    accessible
                    style={{ color: colors.blue }}
                    onPress={async () =>
                      WebBrowser.openBrowserAsync('https://tooot.app/terms-of-service', {
                        ...(await browserPackage())
                      })
                    }
                  />
                ]}
              />
            </CustomText>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default ComponentInstance
