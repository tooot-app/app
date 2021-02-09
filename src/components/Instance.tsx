import Button from '@components/Button'
import Icon from '@components/Icon'
import { useAppsQuery } from '@utils/queryHooks/apps'
import { useInstanceQuery } from '@utils/queryHooks/instance'
import { getLocalInstances } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as WebBrowser from 'expo-web-browser'
import { debounce } from 'lodash'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Image, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSelector } from 'react-redux'
import { Placeholder, Fade } from 'rn-placeholder'
import analytics from './analytics'
import InstanceAuth from './Instance/Auth'
import EULA from './Instance/EULA'
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
  const { theme } = useTheme()

  const localInstances = useSelector(getLocalInstances, () => true)
  const [instanceDomain, setInstanceDomain] = useState<string>()

  const instanceQuery = useInstanceQuery({
    instanceDomain,
    options: { enabled: false, retry: false }
  })
  const appsQuery = useAppsQuery({
    instanceDomain,
    options: { enabled: false, retry: false }
  })

  const onChangeText = useCallback(
    debounce(
      text => {
        setInstanceDomain(text.replace(/^http(s)?\:\/\//i, ''))
        appsQuery.remove()
        if (text) {
          instanceQuery.refetch()
        }
      },
      1000,
      { trailing: true }
    ),
    []
  )

  const processUpdate = useCallback(() => {
    if (instanceDomain) {
      analytics('instance_local_login')
      if (
        localInstances &&
        localInstances.filter(instance => instance.url === instanceDomain)
          .length
      ) {
        Alert.alert(
          t('update.local.alert.title'),
          t('update.local.alert.message'),
          [
            {
              text: t('update.local.alert.buttons.cancel'),
              style: 'cancel'
            },
            {
              text: t('update.local.alert.buttons.continue'),
              onPress: () => {
                appsQuery.refetch()
              }
            }
          ]
        )
      } else {
        appsQuery.refetch()
      }
    }
  }, [instanceDomain])

  const onSubmitEditing = useCallback(
    ({ nativeEvent: { text } }) => {
      analytics('instance_textinput_submit', { match: text === instanceDomain })
      if (
        text === instanceDomain &&
        instanceQuery.isSuccess &&
        instanceQuery.data &&
        instanceQuery.data.uri
      ) {
        processUpdate()
      }
    },
    [instanceDomain, instanceQuery.isSuccess, instanceQuery.data]
  )

  const requestAuth = useMemo(() => {
    if (
      instanceDomain &&
      instanceQuery.data?.uri &&
      appsQuery.data?.client_id &&
      appsQuery.data.client_secret
    ) {
      return (
        <InstanceAuth
          key={Math.random()}
          instanceDomain={instanceDomain}
          instance={instanceQuery.data}
          appData={{
            clientId: appsQuery.data.client_id,
            clientSecret: appsQuery.data.client_secret
          }}
          goBack={goBack}
        />
      )
    }
  }, [instanceDomain, instanceQuery.data, appsQuery.data])

  const [agreed, setAgreed] = useState(false)

  return (
    <>
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
                color: theme.primary,
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
          />
          <Button
            type='text'
            content={t('server.button.local')}
            onPress={processUpdate}
            disabled={!instanceQuery.data?.uri || !agreed}
            loading={instanceQuery.isFetching || appsQuery.isFetching}
          />
        </View>

        <EULA agreed={agreed} setAgreed={setAgreed} />

        <View>
          <Placeholder
            {...(instanceQuery.isFetching && {
              Animation: props => (
                <Fade
                  {...props}
                  style={{ backgroundColor: theme.shimmerHighlight }}
                />
              )
            })}
          >
            <InstanceInfo
              visible={instanceQuery.data?.title !== undefined}
              header={t('server.information.name')}
              content={instanceQuery.data?.title || undefined}
              potentialWidth={2}
            />
            <View style={styles.instanceStats}>
              <InstanceInfo
                style={styles.stat1}
                visible={instanceQuery.data?.stats?.user_count !== undefined}
                header={t('server.information.accounts')}
                content={
                  instanceQuery.data?.stats?.user_count?.toString() || undefined
                }
                potentialWidth={4}
              />
              <InstanceInfo
                style={styles.stat2}
                visible={instanceQuery.data?.stats?.status_count !== undefined}
                header={t('server.information.statuses')}
                content={
                  instanceQuery.data?.stats?.status_count?.toString() ||
                  undefined
                }
                potentialWidth={4}
              />
              <InstanceInfo
                style={styles.stat3}
                visible={instanceQuery.data?.stats?.domain_count !== undefined}
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
    </>
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
