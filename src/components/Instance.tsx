import Button from '@components/Button'
import Icon from '@components/Icon'
import { useAppsQuery } from '@utils/queryHooks/apps'
import { useInstanceQuery } from '@utils/queryHooks/instance'
import { getInstances } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as WebBrowser from 'expo-web-browser'
import { debounce } from 'lodash'
import React, { RefObject, useCallback, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Alert, Image, KeyboardAvoidingView, Platform, TextInput, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useSelector } from 'react-redux'
import { Placeholder } from 'rn-placeholder'
import InstanceAuth from './Instance/Auth'
import InstanceInfo from './Instance/Info'
import CustomText from './Text'

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

  const instances = useSelector(getInstances, () => true)
  const [domain, setDomain] = useState<string>()

  const instanceQuery = useInstanceQuery({
    domain,
    options: { enabled: !!domain, retry: false }
  })
  const appsQuery = useAppsQuery({
    domain,
    options: { enabled: false, retry: false }
  })

  const onChangeText = useCallback(
    debounce(
      text => {
        setDomain(text.replace(/^http(s)?\:\/\//i, ''))
        appsQuery.remove()
      },
      1000,
      { trailing: true }
    ),
    []
  )

  const processUpdate = useCallback(() => {
    if (domain) {
      if (instances && instances.filter(instance => instance.url === domain).length) {
        Alert.alert(t('update.alert.title'), t('update.alert.message'), [
          {
            text: t('update.alert.buttons.cancel'),
            style: 'cancel'
          },
          {
            text: t('update.alert.buttons.continue'),
            onPress: () => {
              appsQuery.refetch()
            }
          }
        ])
      } else {
        appsQuery.refetch()
      }
    }
  }, [domain])

  const requestAuth = useMemo(() => {
    if (
      domain &&
      instanceQuery.data?.uri &&
      appsQuery.data?.client_id &&
      appsQuery.data.client_secret
    ) {
      return (
        <InstanceAuth
          key={Math.random()}
          instanceDomain={domain}
          instance={instanceQuery.data}
          appData={{
            clientId: appsQuery.data.client_id,
            clientSecret: appsQuery.data.client_secret
          }}
          goBack={goBack}
        />
      )
    }
  }, [domain, instanceQuery.data, appsQuery.data])

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
              borderBottomColor: instanceQuery.isError ? colors.red : colors.border
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
              borderBottomColor: instanceQuery.isError ? colors.red : colors.border
            }}
            onChangeText={onChangeText}
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
            loading={instanceQuery.isFetching || appsQuery.isFetching}
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
                    onPress={() => WebBrowser.openBrowserAsync('https://tooot.app/privacy-policy')}
                  />,
                  <CustomText
                    accessible
                    style={{ color: colors.blue }}
                    onPress={() =>
                      WebBrowser.openBrowserAsync('https://tooot.app/terms-of-service')
                    }
                  />
                ]}
              />
            </CustomText>
          </View>
        </View>
      </View>

      {requestAuth}
    </KeyboardAvoidingView>
  )
}

export default ComponentInstance
