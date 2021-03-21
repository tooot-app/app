import Button from '@components/Button'
import Icon from '@components/Icon'
import { useAppsQuery } from '@utils/queryHooks/apps'
import { useInstanceQuery } from '@utils/queryHooks/instance'
import { getInstances } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as WebBrowser from 'expo-web-browser'
import { debounce } from 'lodash'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { useSelector } from 'react-redux'
import { Placeholder } from 'rn-placeholder'
import analytics from './analytics'
import InstanceAuth from './Instance/Auth'
import InstanceInfo from './Instance/Info'

export interface Props {
  disableHeaderImage?: boolean
  goBack?: boolean
}

const ComponentInstance: React.FC<Props> = ({
  disableHeaderImage,
  goBack = false
}) => {
  const { t } = useTranslation('componentInstance')
  const { mode, theme } = useTheme()

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
      analytics('instance_login')
      if (
        instances &&
        instances.filter(instance => instance.url === domain).length
      ) {
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

  const onSubmitEditing = useCallback(
    ({ nativeEvent: { text } }) => {
      analytics('instance_textinput_submit', { match: text === domain })
      if (
        text === domain &&
        instanceQuery.isSuccess &&
        instanceQuery.data &&
        instanceQuery.data.uri
      ) {
        processUpdate()
      }
    },
    [domain, instanceQuery.isSuccess, instanceQuery.data]
  )

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
        <View style={styles.imageContainer}>
          <Image
            source={require('assets/screens/meRoot/welcome.png')}
            style={styles.image}
          />
        </View>
      ) : null}
      <View style={styles.base}>
        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.textInput,
              {
                color: theme.primaryDefault,
                borderBottomColor: instanceQuery.isError
                  ? theme.red
                  : theme.border
              }
            ]}
            onChangeText={onChangeText}
            autoCapitalize='none'
            autoCorrect={false}
            clearButtonMode='never'
            keyboardType='url'
            textContentType='URL'
            onSubmitEditing={onSubmitEditing}
            placeholder={t('server.textInput.placeholder')}
            placeholderTextColor={theme.secondary}
            returnKeyType='go'
            keyboardAppearance={mode}
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
            <View style={styles.instanceStats}>
              <InstanceInfo
                style={styles.stat1}
                header={t('server.information.accounts')}
                content={
                  instanceQuery.data?.stats?.user_count?.toString() || undefined
                }
                potentialWidth={4}
              />
              <InstanceInfo
                style={styles.stat2}
                header={t('server.information.statuses')}
                content={
                  instanceQuery.data?.stats?.status_count?.toString() ||
                  undefined
                }
                potentialWidth={4}
              />
              <InstanceInfo
                style={styles.stat3}
                header={t('server.information.domains')}
                content={
                  instanceQuery.data?.stats?.domain_count?.toString() ||
                  undefined
                }
                potentialWidth={4}
              />
            </View>
          </Placeholder>
          <View style={styles.disclaimer}>
            <Icon
              name='Lock'
              size={StyleConstants.Font.Size.S}
              color={theme.secondary}
              style={styles.disclaimerIcon}
            />
            <Text style={[styles.disclaimerText, { color: theme.secondary }]}>
              {t('server.disclaimer.base')}
              <Text
                style={{ color: theme.blue }}
                onPress={() => {
                  analytics('view_privacy')
                  WebBrowser.openBrowserAsync(
                    'https://tooot.app/privacy-policy'
                  )
                }}
              >
                {t('server.disclaimer.privacy')}
              </Text>
            </Text>
          </View>
        </View>
      </View>

      {requestAuth}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  imageContainer: { flexDirection: 'row' },
  image: { resizeMode: 'contain', flex: 1, aspectRatio: 16 / 9 },
  base: {
    marginVertical: StyleConstants.Spacing.L,
    marginHorizontal: StyleConstants.Spacing.Global.PagePadding
  },
  inputRow: {
    flexDirection: 'row',
    marginHorizontal: StyleConstants.Spacing.Global.PagePadding
  },
  textInput: {
    flex: 1,
    borderBottomWidth: 1,
    ...StyleConstants.FontStyle.M,
    marginRight: StyleConstants.Spacing.M
  },
  privateInstance: {
    ...StyleConstants.FontStyle.S,
    fontWeight: StyleConstants.Font.Weight.Bold,
    marginLeft: StyleConstants.Spacing.Global.PagePadding,
    marginTop: StyleConstants.Spacing.XS
  },
  instanceStats: {
    flex: 1,
    flexDirection: 'row'
  },
  stat1: {
    alignItems: 'flex-start'
  },
  stat2: {
    alignItems: 'center'
  },
  stat3: {
    alignItems: 'flex-end'
  },
  disclaimer: {
    flexDirection: 'row',
    marginHorizontal: StyleConstants.Spacing.Global.PagePadding,
    marginVertical: StyleConstants.Spacing.M
  },
  disclaimerIcon: {
    marginTop:
      (StyleConstants.Font.LineHeight.S - StyleConstants.Font.Size.S) / 2,
    marginRight: StyleConstants.Spacing.XS
  },
  disclaimerText: {
    flex: 1,
    ...StyleConstants.FontStyle.S
  }
})

export default ComponentInstance
