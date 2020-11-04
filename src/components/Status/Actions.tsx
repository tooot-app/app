import React, { useEffect, useState } from 'react'
import {
  ActionSheetIOS,
  Clipboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { useDispatch } from 'react-redux'
import { Feather } from '@expo/vector-icons'

import action from './action'
import Success from './Responses/Success'

export interface Props {
  id: string
  url: string
  replies_count: number
  reblogs_count: number
  reblogged?: boolean
  favourites_count: number
  favourited?: boolean
  bookmarked: boolean
}

const Actions: React.FC<Props> = ({
  id,
  url,
  replies_count,
  reblogs_count,
  reblogged,
  favourites_count,
  favourited,
  bookmarked
}) => {
  const dispatch = useDispatch()
  const [modalVisible, setModalVisible] = useState(false)

  const [successMessage, setSuccessMessage] = useState()
  useEffect(() => {
    setTimeout(() => {
      setSuccessMessage(undefined)
    }, 2000)
    return () => {}
  }, [successMessage])

  return (
    <>
      <Success message={successMessage} />

      <View style={styles.actions}>
        <Pressable style={styles.action}>
          <Feather name='message-circle' color='gray' />
          {replies_count > 0 && <Text>{replies_count}</Text>}
        </Pressable>

        <Pressable
          style={styles.action}
          onPress={() =>
            action({
              dispatch,
              id,
              type: 'reblog',
              stateKey: 'reblogged',
              statePrev: reblogged || false
            })
          }
        >
          <Feather name='repeat' color={reblogged ? 'black' : 'gray'} />
        </Pressable>

        <Pressable
          style={styles.action}
          onPress={() =>
            action({
              dispatch,
              id,
              type: 'favourite',
              stateKey: 'favourited',
              statePrev: favourited || false
            })
          }
        >
          <Feather name='heart' color={favourited ? 'black' : 'gray'} />
        </Pressable>

        <Pressable
          style={styles.action}
          onPress={() =>
            action({
              dispatch,
              id,
              type: 'bookmark',
              stateKey: 'bookmarked',
              statePrev: bookmarked
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
