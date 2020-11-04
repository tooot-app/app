import React, { useEffect, useState } from 'react'
import {
  ActionSheetIOS,
  Alert,
  Clipboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { useMutation, useQueryCache } from 'react-query'
import { Feather } from '@expo/vector-icons'

import client from 'src/api/client'

import Success from './Responses/Success'

const fireMutation = async ({
  id,
  type,
  stateKey,
  prevState
}: {
  id: string
  type: 'favourite' | 'reblog' | 'bookmark' | 'mute' | 'pin'
  stateKey: 'favourited' | 'reblogged' | 'bookmarked' | 'muted' | 'pinned'
  prevState: boolean
}) => {
  let res = await client({
    method: 'post',
    instance: 'local',
    endpoint: `statuses/${id}/${prevState ? 'un' : ''}${type}`
  })
  res = await client({
    method: 'post',
    instance: 'local',
    endpoint: `statuses/${id}/${prevState ? 'un' : ''}${type}`
  })

  if (!res.body[stateKey] === prevState) {
    return Promise.resolve(res.body)
  } else {
    const alert = {
      title: 'This is a title',
      message: 'This is a message'
    }
    Alert.alert(alert.title, alert.message, [
      { text: 'OK', onPress: () => console.log('OK Pressed') }
    ])
    return Promise.reject()
  }
}

export interface Props {
  queryKey: store.QueryKey
  id: string
  url: string
  replies_count: number
  reblogs_count: number
  reblogged?: boolean
  favourites_count: number
  favourited?: boolean
  bookmarked?: boolean
}

const Actions: React.FC<Props> = ({
  queryKey,
  id,
  url,
  replies_count,
  reblogs_count,
  reblogged,
  favourites_count,
  favourited,
  bookmarked
}) => {
  const [modalVisible, setModalVisible] = useState(false)

  const [successMessage, setSuccessMessage] = useState()
  useEffect(() => {
    setTimeout(() => {
      setSuccessMessage(undefined)
    }, 2000)
    return () => {}
  }, [successMessage])

  const queryCache = useQueryCache()
  const [mutateAction] = useMutation(fireMutation, {
    onMutate: () => {
      queryCache.cancelQueries(queryKey)
      const prevData = queryCache.getQueryData(queryKey)
      return prevData
    },
    onSuccess: (newData, params) => {
      if (params.type === 'reblog') {
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

  return (
    <>
      <View style={styles.actions}>
        <Pressable style={styles.action}>
          <Feather name='message-circle' color='gray' />
          {replies_count > 0 && <Text>{replies_count}</Text>}
        </Pressable>

        <Pressable
          style={styles.action}
          onPress={() =>
            mutateAction({
              id,
              type: 'reblog',
              stateKey: 'reblogged',
              prevState: reblogged || false
            })
          }
        >
          <Feather name='repeat' color={reblogged ? 'black' : 'gray'} />
        </Pressable>

        <Pressable
          style={styles.action}
          onPress={() =>
            mutateAction({
              id,
              type: 'favourite',
              stateKey: 'favourited',
              prevState: favourited || false
            })
          }
        >
          <Feather name='heart' color={favourited ? 'black' : 'gray'} />
        </Pressable>

        <Pressable
          style={styles.action}
          onPress={() =>
            mutateAction({
              id,
              type: 'bookmark',
              stateKey: 'bookmarked',
              prevState: bookmarked || false
            })
          }
        >
          <Feather name='bookmark' color={bookmarked ? 'black' : 'gray'} />
        </Pressable>

        <Pressable style={styles.action} onPress={() => setModalVisible(true)}>
          <Feather name='more-horizontal' color='gray' />
        </Pressable>
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
            <Pressable
              onPress={() =>
                ActionSheetIOS.showShareActionSheetWithOptions(
                  {
                    url,
                    excludedActivityTypes: [
                      'com.apple.UIKit.activity.Mail',
                      'com.apple.UIKit.activity.Print',
                      'com.apple.UIKit.activity.SaveToCameraRoll',
                      'com.apple.UIKit.activity.OpenInIBooks'
                    ]
                  },
                  () => {},
                  () => {
                    setModalVisible(false)
                    setSuccessMessage('分享成功！')
                  }
                )
              }
            >
              <Text>分享</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Clipboard.setString(url)
                // Success message
                setModalVisible(false)
              }}
            >
              <Text>复制链接</Text>
            </Pressable>
            <Text>（删除）</Text>
            <Text>（静音），（置顶）</Text>
            <Text>静音用户，屏蔽用户，屏蔽域名，举报用户</Text>
          </View>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  actions: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    marginTop: 8
  },
  action: {
    width: '20%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 8
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

export default Actions
