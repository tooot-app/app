import Button from '@components/Button'
import haptics from '@components/haptics'
import Icon from '@components/Icon'
import { useNavigation } from '@react-navigation/native'
import { useAppsQuery } from '@utils/queryHooks/apps'
import { useInstanceQuery } from '@utils/queryHooks/instance'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { getLocalInstances, remoteUpdate } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Linking from 'expo-linking'
import { debounce } from 'lodash'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Image, StyleSheet, Text, TextInput, View } from 'react-native'
import { useQueryClient } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import InstanceAuth from './Instance/Auth'
import InstanceInfo from './Instance/Info'
import { toast } from './toast'

export interface Props {
  type: 'local' | 'remote'
  disableHeaderImage?: boolean
  goBack?: boolean
}

const ComponentInstance: React.FC<Props> = ({
  type,
  disableHeaderImage,
  goBack = false
}) => {
  const { t } = useTranslation('componentInstance')
  const { theme } = useTheme()
  const navigation = useNavigation()

  const localInstances = useSelector(getLocalInstances)
  const dispatch = useDispatch()

  const queryClient = useQueryClient()
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
      switch (type) {
        case 'local':
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
          break
        case 'remote':
          haptics('Success')
          const queryKey: QueryKeyTimeline = [
            'Timeline',
            { page: 'RemotePublic' }
          ]
          dispatch(remoteUpdate(instanceDomain))
          queryClient.resetQueries(queryKey)
          toast({ type: 'success', message: t('update.remote.succeed') })
          navigation.goBack()
          break
      }
    }
  }, [instanceDomain])

  const onSubmitEditing = useCallback(
    ({ nativeEvent: { text } }) => {
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

  const buttonContent = useMemo(() => {
    switch (type) {
      case 'local':
        return t('server.button.local')
      case 'remote':
        return t('server.button.remote')
    }
  }, [])

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
          instanceUri={instanceQuery.data.uri}
          appData={{
            clientId: appsQuery.data.client_id,
            clientSecret: appsQuery.data.client_secret
          }}
          goBack={goBack}
        />
      )
    }
  }, [instanceDomain, instanceQuery.data, appsQuery.data])

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
                borderBottomColor: theme.border
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
            content={buttonContent}
            onPress={processUpdate}
            disabled={!instanceQuery.data?.uri}
            loading={instanceQuery.isFetching || appsQuery.isFetching}
          />
        </View>
        <View>
          <InstanceInfo
            visible={instanceQuery.data?.title !== undefined}
            header={t('server.information.name')}
            content={instanceQuery.data?.title || undefined}
            potentialWidth={10}
          />
          <InstanceInfo
            visible={instanceQuery.data?.short_description !== undefined}
            header={t('server.information.description.heading')}
            content={instanceQuery.data?.short_description || undefined}
            potentialLines={5}
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
                instanceQuery.data?.stats?.status_count?.toString() || undefined
              }
              potentialWidth={4}
            />
            <InstanceInfo
              style={styles.stat3}
              visible={instanceQuery.data?.stats?.domain_count !== undefined}
              header={t('server.information.domains')}
              content={
                instanceQuery.data?.stats?.domain_count?.toString() || undefined
              }
              potentialWidth={4}
            />
          </View>
          {type === 'local' ? (
            <View style={styles.disclaimer}>
              <Icon
                name='Lock'
                size={StyleConstants.Font.Size.S}
                color={theme.secondary}
                style={styles.disclaimerIcon}
              />
              <Text
                style={[styles.disclaimerText, { color: theme.secondary }]}
                onPress={() => Linking.openURL('https://tooot.app/privacy')}
              >
                {t('server.disclaimer')}
                <Text style={{ color: theme.blue }}>
                  https://tooot.app/privacy
                </Text>
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {type === 'local' ? requestAuth : null}
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
