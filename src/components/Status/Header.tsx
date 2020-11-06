import React, { useEffect, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { useMutation, useQueryCache } from 'react-query'

import Emojis from './Emojis'
import relativeTime from 'src/utils/relativeTime'
import client from 'src/api/client'
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

      if (res.body[stateKey] === true) {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: '功能成功',
          visibilityTime: 2000,
          autoHide: true,
          bottomOffset: 65
        })
        return Promise.resolve()
      } else {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: '请重试',
          autoHide: false,
          bottomOffset: 65
        })
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
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: '隐藏域名成功',
          visibilityTime: 2000,
          autoHide: true,
          bottomOffset: 65
        })
        return Promise.resolve()
      } else {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: '隐藏域名失败，请重试',
          autoHide: false,
          bottomOffset: 65
        })
        return Promise.reject()
      }
      break
    // case 'reports':
    //   res = await client({
    //     method: 'post',
    //     instance: 'local',
    //     endpoint: `reports`,
    //     query: {
    //       domain: id || ''
    //     }
    //   })

    //   if (!res.body.error) {
    //     Toast.show({
    //       type: 'success',
    //       position: 'bottom',
    //       text1: '隐藏域名成功',
    //       visibilityTime: 2000,
    //       autoHide: true,
    //       bottomOffset: 65
    //     })
    //     return Promise.resolve()
    //   } else {
    //     Toast.show({
    //       type: 'error',
    //       position: 'bottom',
    //       text1: '隐藏域名失败，请重试',
    //       autoHide: false,
    //       bottomOffset: 65
    //     })
    //     return Promise.reject()
    //   }
    //   break
  }
}

export interface Props {
  queryKey: store.QueryKey
  accountId: string
  domain: string
  name: string
  emojis?: mastodon.Emoji[]
  account: string
  created_at: string
  application?: mastodon.Application
}

const Header: React.FC<Props> = ({
  queryKey,
  accountId,
  domain,
  name,
  emojis,
  account,
  created_at,
  application
}) => {
  const navigation = useNavigation()
  const localAccountId = useSelector(state => state.instanceInfo.localAccountId)
  const localDomain = useSelector(state => state.instanceInfo.local)
  const [since, setSince] = useState(relativeTime(created_at))
  const [modalVisible, setModalVisible] = useState(false)

  const queryCache = useQueryCache()
  const [mutateAction] = useMutation(fireMutation, {
    onMutate: () => {
      queryCache.cancelQueries(queryKey)
      const prevData = queryCache.getQueryData(queryKey)
      return prevData
    },
    onSuccess: (newData, params) => {
      if (params.type === 'domain_blocks') {
        console.log('clearing cache')
        queryCache.invalidateQueries(['Following', { page: 'Following' }])
      }
      // queryCache.setQueryData(queryKey, (oldData: any) => {
      //   oldData &&
      //     oldData.map((paging: any) => {
      //       paging.toots.map(
      //         (status: mastodon.Status | mastodon.Notification, i: number) => {
      //           if (status.id === newData.id) {
      //             paging.toots[i] = newData
      //           }
      //         }
      //       )
      //     })
      //   return oldData
      // })
      return Promise.resolve()
    },
    onError: (err, variables, prevData) => {
      queryCache.setQueryData(queryKey, prevData)
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

  return (
    <View>
      <View style={styles.nameAndAction}>
        <View style={styles.name}>
          {emojis ? (
            <Emojis content={name} emojis={emojis} dimension={14} />
          ) : (
            <Text numberOfLines={1}>{name}</Text>
          )}
        </View>
        {accountId !== localAccountId && domain !== localDomain && (
          <Pressable
            style={styles.action}
            onPress={() => setModalVisible(true)}
          >
            <Feather name='more-horizontal' color='gray' />
          </Pressable>
        )}
      </View>
      <Text style={styles.account} numberOfLines={1}>
        @{account}
      </Text>
      <View style={styles.meta}>
        <View>
          <Text style={styles.created_at}>{since}</Text>
        </View>
        {application && application.name !== 'Web' && (
          <View>
            <Text
              onPress={() => {
                navigation.navigate('Webview', {
                  uri: application.website
                })
              }}
              style={styles.application}
            >
              {application.name}
            </Text>
          </View>
        )}
      </View>

      <Modal
        animationType='fade'
        presentationStyle='overFullScreen'
        transparent
        visible={modalVisible}
      >
        <Pressable
          style={styles.modalBackground}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalSheet}>
            {accountId !== localAccountId && (
              <Pressable
                onPress={() => {
                  setModalVisible(false)
                  mutateAction({
                    id: accountId,
                    type: 'mute',
                    stateKey: 'muting'
                  })
                }}
              >
                <Text>静音用户</Text>
              </Pressable>
            )}
            {accountId !== localAccountId && (
              <Pressable
                onPress={() => {
                  setModalVisible(false)
                  mutateAction({
                    id: accountId,
                    type: 'block',
                    stateKey: 'blocking'
                  })
                }}
              >
                <Text>屏蔽用户</Text>
              </Pressable>
            )}
            {domain !== localDomain && (
              <Pressable
                onPress={() => {
                  setModalVisible(false)
                  mutateAction({
                    id: domain,
                    type: 'domain_blocks'
                  })
                }}
              >
                <Text>屏蔽域名</Text>
              </Pressable>
            )}
            {accountId !== localAccountId && (
              <Pressable
                onPress={() => {
                  setModalVisible(false)
                  mutateAction({
                    id: accountId,
                    type: 'reports'
                  })
                }}
              >
                <Text>举报用户</Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>
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
    flexDirection: 'row',
    marginRight: 8,
    fontWeight: '900'
  },
  action: {
    width: 14,
    height: 14,
    marginLeft: 8
  },
  account: {
    lineHeight: 14,
    flexShrink: 1
  },
  meta: {
    flexDirection: 'row'
  },
  created_at: {
    fontSize: 12,
    lineHeight: 12,
    marginTop: 8,
    marginBottom: 8,
    marginRight: 8
  },
  application: {
    fontSize: 12,
    lineHeight: 11
  },
  modalBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  modalSheet: {
    width: '100%',
    height: '50%',
    backgroundColor: 'white',
    flex: 1
  }
})

export default Header
