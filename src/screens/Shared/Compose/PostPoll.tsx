import React, { Dispatch, useState } from 'react'
import {
  ActionSheetIOS,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { Feather } from '@expo/vector-icons'

import { PostAction, PostState } from '../Compose'

export interface Props {
  postState: PostState
  postDispatch: Dispatch<PostAction>
}

const PostPoll: React.FC<Props> = ({ postState, postDispatch }) => {
  const expireMapping: { [key: string]: string } = {
    '300': '5分钟',
    '1800': '30分钟',
    '3600': '1小时',
    '21600': '6小时',
    '86400': '1天',
    '259200': '3天',
    '604800': '7天'
  }

  return (
    <View style={styles.base}>
      {[...Array(postState.poll.total)].map((e, i) => (
        <View key={i} style={styles.option}>
          {postState.poll.multiple ? (
            <Feather name='square' size={20} />
          ) : (
            <Feather name='circle' size={20} />
          )}
          <TextInput
            style={styles.textInput}
            maxLength={50}
            value={postState.poll.options[i]}
            onChangeText={e =>
              postDispatch({
                type: 'poll',
                payload: {
                  ...postState.poll,
                  options: { ...postState.poll.options, [i]: e }
                }
              })
            }
          />
        </View>
      ))}
      <View style={styles.totalControl}>
        <Feather
          name='minus'
          size={20}
          color={postState.poll.total > 2 ? 'black' : 'grey'}
          onPress={() =>
            postState.poll.total > 2 &&
            postDispatch({
              type: 'poll',
              payload: { ...postState.poll, total: postState.poll.total - 1 }
            })
          }
        />
        <Feather
          name='plus'
          size={20}
          color={postState.poll.total < 4 ? 'black' : 'grey'}
          onPress={() =>
            postState.poll.total < 4 &&
            postDispatch({
              type: 'poll',
              payload: { ...postState.poll, total: postState.poll.total + 1 }
            })
          }
        />
      </View>
      <Pressable
        onPress={() =>
          ActionSheetIOS.showActionSheetWithOptions(
            {
              options: ['单选', '多选', '取消'],
              cancelButtonIndex: 2
            },
            index =>
              index < 2 &&
              postDispatch({
                type: 'poll',
                payload: { ...postState.poll, multiple: index === 1 }
              })
          )
        }
      >
        <Text>{postState.poll.multiple ? '多选' : '单选'}</Text>
      </Pressable>
      <Pressable
        onPress={() =>
          ActionSheetIOS.showActionSheetWithOptions(
            {
              options: [...Object.values(expireMapping), '取消'],
              cancelButtonIndex: 7
            },
            index =>
              index < 7 &&
              postDispatch({
                type: 'poll',
                payload: {
                  ...postState.poll,
                  expire: Object.keys(expireMapping)[index]
                }
              })
          )
        }
      >
        <Text>{expireMapping[postState.poll.expire]}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: 'green'
  },
  option: {
    height: 30,
    margin: 5,
    flexDirection: 'row'
  },
  textInput: {
    flex: 1,
    backgroundColor: 'white'
  },
  totalControl: {
    alignSelf: 'flex-end',
    flexDirection: 'row'
  }
})

export default PostPoll
