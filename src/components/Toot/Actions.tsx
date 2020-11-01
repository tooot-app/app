import React, { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { Feather } from '@expo/vector-icons'

import action from './action'

export interface Props {
  id: string
  replies_count: number
  reblogs_count: number
  reblogged?: boolean
  favourites_count: number
  favourited?: boolean
  bookmarked: boolean
}

const Actions: React.FC<Props> = ({
  id,
  replies_count,
  reblogs_count,
  reblogged,
  favourites_count,
  favourited,
  bookmarked
}) => {
  const dispatch = useDispatch()
  const [modalVisible, setModalVisible] = useState(false)

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
            <Text>分享，复制链接，（删除）</Text>
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
