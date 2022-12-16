import Button from '@components/Button'
import Icon from '@components/Icon'
import browserPackage from '@helpers/browserPackage'
import { redirectUri, useAppsMutation } from '@utils/queryHooks/apps'
import { useInstanceQuery } from '@utils/queryHooks/instance'
import { checkInstanceFeature, getInstances } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { debounce } from 'lodash'
import React, { RefObject, useCallback, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Alert, Image, KeyboardAvoidingView, Platform, TextInput, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useSelector } from 'react-redux'
import { Placeholder } from 'rn-placeholder'
import InstanceInfo from './Info'
import CustomText from '../Text'
import { useNavigation } from '@react-navigation/native'
import { TabMeStackNavigationProp } from '@utils/navigation/navigators'
import queryClient from '@helpers/queryClient'
import { useAppDispatch } from '@root/store'
import addInstance from '@utils/slices/instances/add'

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
  const { t } = useTranslation('componentInstance')
  const { colors, mode } = useTheme()
  const navigation = useNavigation<TabMeStackNavigationProp<'Tab-Me-Root' | 'Tab-Me-Switch'>>()

  const [domain, setDomain] = useState<string>('')

  const dispatch = useAppDispatch()
  const instances = useSelector(getInstances, () => true)
  const instanceQuery = useInstanceQuery({
    domain,
    options: { enabled: !!domain, retry: false }
  })

  const deprecateAuthFollow = useSelector(checkInstanceFeature('deprecate_auth_follow'))

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
        dispatch(
          addInstance({
            domain,
            token: accessToken,
            instance: instanceQuery.data!,
            appData: { clientId, clientSecret }
          })
        )
        goBack && navigation.goBack()
      }
    }
  })

  const processUpdate = useCallback(() => {
    if (domain) {
      if (instances && instances.filter(instance => instance.url === domain).length) {
        Alert.alert(t('update.alert.title'), t('update.alert.message'), [
          {
            text: t('common:buttons.cancel'),
            style: 'cancel'
          },
          {
            text: t('common:buttons.continue'),
            onPress: () => appsMutation.mutate({ domain })
          }
        ])
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
              borderBottomColor: instanceQuery.isError ? colors.red : colors.border,
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
              borderBottomColor: instanceQuery.isError ? colors.red : colors.border,
              ...(Platform.OS === 'android' && { paddingLeft: 0 })
            }}
            onChangeText={debounce(text => setDomain(text.replace(/^http(s)?\:\/\//i, '')), 1000, {
              trailing: true
            })}
            autoCapitalize='none'
            clearButtonMode='never'
            keyboardType='url'
            textContentType='URL'
            onSubmitEditing={({ nativeEvent: { text } }) => {
              if (
                text === domain &&
                instanceQuery.isSuccess &&
                instanceQuery.data &&
                instanceQuery.data.uri
              ) {
                processUpdate()
              }
            }}
            placeholder={' ' + t('server.textInput.placeholder')}
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
            content={t('server.button')}
            onPress={processUpdate}
            disabled={!instanceQuery.data?.uri}
            loading={instanceQuery.isFetching || appsMutation.isLoading}
          />
        </View>

        <View>
          <Placeholder>
            <InstanceInfo
              header={t('server.information.name')}
              content={instanceQuery.data?.title || undefined}
              potentialWidth={2}
            />
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <InstanceInfo
                style={{ alignItems: 'flex-start' }}
                header={t('server.information.accounts')}
                content={instanceQuery.data?.stats?.user_count?.toString() || undefined}
                potentialWidth={4}
              />
              <InstanceInfo
                style={{ alignItems: 'center' }}
                header={t('server.information.statuses')}
                content={instanceQuery.data?.stats?.status_count?.toString() || undefined}
                potentialWidth={4}
              />
              <InstanceInfo
                style={{ alignItems: 'flex-end' }}
                header={t('server.information.domains')}
                content={instanceQuery.data?.stats?.domain_count?.toString() || undefined}
                potentialWidth={4}
              />
            </View>
          </Placeholder>
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
              {t('server.disclaimer.base')}
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
                i18nKey='componentInstance:server.terms.base'
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
