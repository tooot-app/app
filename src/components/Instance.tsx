import Button from '@components/Button'
import haptics from '@components/haptics'
import Icon from '@components/Icon'
import { useNavigation } from '@react-navigation/native'
import hookApps from '@utils/queryHooks/apps'
import hookInstance from '@utils/queryHooks/instance'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { InstanceLocal, remoteUpdate } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, StyleSheet, Text, TextInput, View } from 'react-native'
import { useQueryClient } from 'react-query'
import { useDispatch } from 'react-redux'
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
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const { t } = useTranslation('meRoot')
  const { theme } = useTheme()
  const [instanceDomain, setInstanceDomain] = useState<string | undefined>()
  const [appData, setApplicationData] = useState<InstanceLocal['appData']>()

  const instanceQuery = hookInstance({
    instanceDomain,
    options: { enabled: false, retry: false }
  })
  const applicationQuery = hookApps({
    instanceDomain,
    options: { enabled: false, retry: false }
  })

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

  const processUpdate = useCallback(() => {
    if (instanceDomain) {
      haptics('Success')
      switch (type) {
        case 'local':
          applicationQuery.refetch()
          return
        case 'remote':
          const queryKey: QueryKeyTimeline = [
            'Timeline',
            { page: 'RemotePublic' }
          ]
          dispatch(remoteUpdate(instanceDomain))
          queryClient.resetQueries(queryKey)
          toast({ type: 'success', message: '重置成功' })
          navigation.navigate('Screen-Remote-Root')
          return
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
      } else {
        setInstanceDomain(text)
        setApplicationData(undefined)
      }
    },
    [instanceDomain, instanceQuery.isSuccess, instanceQuery.data]
  )

  const buttonContent = useMemo(() => {
    switch (type) {
      case 'local':
        return t('content.login.button')
      case 'remote':
        return '登记'
    }
  }, [])

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
            placeholder={t('content.login.server.placeholder')}
            placeholderTextColor={theme.secondary}
            returnKeyType='go'
          />
          <Button
            type='text'
            content={buttonContent}
            onPress={processUpdate}
            disabled={!instanceQuery.data?.uri}
            loading={instanceQuery.isFetching || applicationQuery.isFetching}
          />
        </View>
        <View>
          <InstanceInfo
            visible={instanceQuery.data?.title !== undefined}
            header='实例名称'
            content={instanceQuery.data?.title || undefined}
            potentialWidth={10}
          />
          <InstanceInfo
            visible={instanceQuery.data?.short_description !== undefined}
            header='实例介绍'
            content={instanceQuery.data?.short_description || undefined}
            potentialLines={5}
          />
          <View style={styles.instanceStats}>
            <InstanceInfo
              style={{ alignItems: 'flex-start' }}
              visible={instanceQuery.data?.stats?.user_count !== null}
              header='用户总数'
              content={
                instanceQuery.data?.stats?.user_count?.toString() || undefined
              }
              potentialWidth={4}
            />
            <InstanceInfo
              style={{ alignItems: 'center' }}
              visible={instanceQuery.data?.stats?.status_count !== null}
              header='嘟嘟总数'
              content={
                instanceQuery.data?.stats?.status_count?.toString() || undefined
              }
              potentialWidth={4}
            />
            <InstanceInfo
              style={{ alignItems: 'flex-end' }}
              visible={instanceQuery.data?.stats?.domain_count !== null}
              header='嘟嘟总数'
              content={
                instanceQuery.data?.stats?.domain_count?.toString() || undefined
              }
              potentialWidth={4}
            />
          </View>
          <Text style={[styles.disclaimer, { color: theme.secondary }]}>
            <Icon
              name='Lock'
              size={StyleConstants.Font.Size.M}
              color={theme.secondary}
            />{' '}
            本站不留存任何信息
          </Text>
        </View>
      </View>

      {type === 'local' && appData ? (
        <InstanceAuth
          instanceDomain={instanceDomain!}
          appData={appData}
          goBack={goBack}
        />
      ) : null}
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
  disclaimer: {
    ...StyleConstants.FontStyle.S,
    marginHorizontal: StyleConstants.Spacing.Global.PagePadding,
    marginVertical: StyleConstants.Spacing.M
  }
})

export default ComponentInstance
