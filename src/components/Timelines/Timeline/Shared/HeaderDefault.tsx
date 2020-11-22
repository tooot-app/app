import React, { useEffect, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { useMutation, useQueryCache } from 'react-query'

import Emojis from './Emojis'
import relativeTime from 'src/utils/relativeTime'
import client from 'src/api/client'
import { getLocalAccountId, getLocalUrl } from 'src/utils/slices/instancesSlice'
import { store } from 'src/store'
import { useTheme } from 'src/utils/styles/ThemeManager'
import constants from 'src/utils/styles/constants'

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
  queryKey: App.QueryKey
  accountId: string
  domain: string
  name: string
  emojis?: Mastodon.Emoji[]
  account: string
  created_at: string
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
  application
}) => {
  const { theme } = useTheme()

  const navigation = useNavigation()
  const localAccountId = getLocalAccountId(store.getState())
  const localDomain = getLocalUrl(store.getState())
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
      //         (status: Mastodon.Status | Mastodon.Notification, i: number) => {
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
        {accountId !== localAccountId && domain !== localDomain && (
          <Pressable
            style={styles.action}
            onPress={() => setModalVisible(true)}
          >
            <Feather
              name='more-horizontal'
              color={theme.secondary}
              size={constants.FONT_SIZE_M + 2}
            />
          </Pressable>
        )}
      </View>
      <View style={styles.meta}>
        <View>
          <Text style={[styles.created_at, { color: theme.secondary }]}>
            {since}
          </Text>
        </View>
        {application && application.name !== 'Web' && (
          <View>
            <Text
              onPress={() => {
                navigation.navigate('Webview', {
                  uri: application.website
                })
              }}
              style={[styles.application, { color: theme.secondary }]}
            >
              发自于 - {application.name}
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
    marginTop: constants.SPACING_XS,
    marginBottom: constants.SPACING_S
  },
  created_at: {
    fontSize: constants.FONT_SIZE_S
  },
  application: {
    fontSize: constants.FONT_SIZE_S,
    marginLeft: constants.SPACING_S
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

export default HeaderDefault
