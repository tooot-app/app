import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import { useMutation, useQueryCache } from 'react-query'

import Emojis from './Emojis'
import relativeTime from 'src/utils/relativeTime'
import client from 'src/api/client'
import { getLocalAccountId, getLocalUrl } from 'src/utils/slices/instancesSlice'
import { useTheme } from 'src/utils/styles/ThemeManager'
import constants from 'src/utils/styles/constants'
import BottomSheet from 'src/components/BottomSheet'
import BottomSheetRow from 'src/components/BottomSheet/Row'
import { toast } from 'src/components/toast'
import { useSelector } from 'react-redux'

const fireMutation = async ({
  id,
  type,
  stateKey
}: {
  id: string
  type: 'mute' | 'block' | 'domain_blocks' | 'reports'
  stateKey?: 'muting' | 'blocking'
}) => {
  let res
  switch (type) {
    case 'mute':
    case 'block':
      res = await client({
        method: 'post',
        instance: 'local',
        endpoint: `accounts/${id}/${type}`
      })

      if (res.body[stateKey!] === true) {
        toast({ type: 'success', content: '功能成功' })
        return Promise.resolve()
      } else {
        toast({ type: 'error', content: '功能错误', autoHide: false })
        return Promise.reject()
      }
      break
    case 'domain_blocks':
      res = await client({
        method: 'post',
        instance: 'local',
        endpoint: `domain_blocks`,
        query: {
          domain: id || ''
        }
      })

      if (!res.body.error) {
        toast({ type: 'success', content: '隐藏域名成功' })
        return Promise.resolve()
      } else {
        toast({
          type: 'error',
          content: '隐藏域名失败，请重试',
          autoHide: false
        })
        return Promise.reject()
      }
      break
    case 'reports':
      console.log('reporting')
      res = await client({
        method: 'post',
        instance: 'local',
        endpoint: `reports`,
        query: {
          account_id: id || ''
        }
      })
      console.log(res.body)
      if (!res.body.error) {
        toast({ type: 'success', content: '举报账户成功' })
        return Promise.resolve()
      } else {
        toast({
          type: 'error',
          content: '举报账户失败，请重试',
          autoHide: false
        })
        return Promise.reject()
      }
      break
  }
}

export interface Props {
  queryKey: App.QueryKey
  accountId: string
  domain: string
  name: string
  emojis?: Mastodon.Emoji[]
  account: string
  created_at: string
  visibility: Mastodon.Status['visibility']
  application?: Mastodon.Application
}

const HeaderDefault: React.FC<Props> = ({
  queryKey,
  accountId,
  domain,
  name,
  emojis,
  account,
  created_at,
  visibility,
  application
}) => {
  const { theme } = useTheme()

  const navigation = useNavigation()
  const localAccountId = useSelector(getLocalAccountId)
  const localDomain = useSelector(getLocalUrl)
  const [since, setSince] = useState(relativeTime(created_at))
  const [modalVisible, setModalVisible] = useState(false)

  const queryCache = useQueryCache()
  const [mutateAction] = useMutation(fireMutation, {
    onMutate: () => {
      queryCache.cancelQueries(queryKey)
      const oldData = queryCache.getQueryData(queryKey)
      return oldData
    },
    onError: (err, _, oldData) => {
      toast({ type: 'error', content: '请重试', autoHide: false })
      queryCache.setQueryData(queryKey, oldData)
    },
    onSettled: () => {
      queryCache.invalidateQueries(queryKey)
    }
  })

  // causing full re-render
  useEffect(() => {
    setTimeout(() => {
      setSince(relativeTime(created_at))
    }, 1000)
  }, [since])

  const onPressAction = useCallback(() => setModalVisible(true), [])
  const onPressApplication = useCallback(() => {
    navigation.navigate('Webview', {
      uri: application!.website
    })
  }, [])

  const pressableAction = useMemo(
    () => (
      <Feather
        name='more-horizontal'
        color={theme.secondary}
        size={constants.FONT_SIZE_M + 2}
      />
    ),
    []
  )

  return (
    <View>
      <View style={styles.nameAndAction}>
        <View style={styles.name}>
          {emojis ? (
            <Emojis
              content={name}
              emojis={emojis}
              size={constants.FONT_SIZE_M}
              fontBold={true}
            />
          ) : (
            <Text numberOfLines={1} style={{ color: theme.primary }}>
              {name}
            </Text>
          )}
          <Text
            style={[styles.account, { color: theme.secondary }]}
            numberOfLines={1}
          >
            @{account}
          </Text>
        </View>
        {(accountId !== localAccountId || domain !== localDomain) && (
          <Pressable
            style={styles.action}
            onPress={onPressAction}
            children={pressableAction}
          />
        )}
      </View>
      <View style={styles.meta}>
        <View>
          <Text style={[styles.created_at, { color: theme.secondary }]}>
            {since}
          </Text>
        </View>
        {visibility === 'private' && (
          <Feather
            name='lock'
            size={constants.FONT_SIZE_S}
            color={theme.secondary}
            style={styles.visibility}
          />
        )}
        {application && application.name !== 'Web' && (
          <View>
            <Text
              onPress={onPressApplication}
              style={[styles.application, { color: theme.secondary }]}
            >
              发自于 - {application.name}
            </Text>
          </View>
        )}
      </View>
      <BottomSheet
        visible={modalVisible}
        handleDismiss={() => setModalVisible(false)}
      >
        {accountId !== localAccountId && (
          <BottomSheetRow
            onPressFunction={() => {
              setModalVisible(false)
              mutateAction({
                id: accountId,
                type: 'mute',
                stateKey: 'muting'
              })
            }}
            icon='eye-off'
            text={`隐藏 @${account} 的嘟嘟`}
          />
        )}
        {accountId !== localAccountId && (
          <BottomSheetRow
            onPressFunction={() => {
              setModalVisible(false)
              mutateAction({
                id: accountId,
                type: 'block',
                stateKey: 'blocking'
              })
            }}
            icon='x-circle'
            text={`屏蔽用户 @${account}`}
          />
        )}
        {domain !== localDomain && (
          <BottomSheetRow
            onPressFunction={() => {
              setModalVisible(false)
              mutateAction({
                id: domain,
                type: 'domain_blocks'
              })
            }}
            icon='cloud-off'
            text={`屏蔽域名 ${domain}`}
          />
        )}
        {accountId !== localAccountId && (
          <BottomSheetRow
            onPressFunction={() => {
              setModalVisible(false)
              mutateAction({
                id: accountId,
                type: 'reports'
              })
            }}
            icon='alert-triangle'
            text={`举报 @${account}`}
          />
        )}
      </BottomSheet>
    </View>
  )
}

const styles = StyleSheet.create({
  nameAndAction: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  name: {
    flexBasis: '80%',
    flexDirection: 'row'
  },
  action: {
    flexBasis: '20%',
    alignItems: 'center'
  },
  account: {
    flexShrink: 1,
    marginLeft: constants.SPACING_XS,
    lineHeight: constants.FONT_SIZE_M + 2
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: constants.SPACING_XS,
    marginBottom: constants.SPACING_S
  },
  created_at: {
    fontSize: constants.FONT_SIZE_S
  },
  visibility: {
    marginLeft: constants.SPACING_S
  },
  application: {
    fontSize: constants.FONT_SIZE_S,
    marginLeft: constants.SPACING_S
  }
})

export default React.memo(HeaderDefault, () => true)
