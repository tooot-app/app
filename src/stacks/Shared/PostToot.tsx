import React, { ReactNode, useEffect, useReducer, useState } from 'react'
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  Text
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { useNavigation } from '@react-navigation/native'

import store from 'src/stacks/common/store'
import PostMain from './PostToot/PostMain'
import client from 'src/api/client'
import { getLocalAccountPreferences } from '../common/instancesSlice'

const Stack = createNativeStackNavigator()

export type PostState = {
  text: {
    count: number
    raw: string
    formatted: ReactNode
  }
  selection: { start: number; end: number }
  overlay: null | 'suggestions' | 'emojis'
  tag:
    | {
        type: 'url' | 'accounts' | 'hashtags'
        text: string
        offset: number
      }
    | undefined
  emojis: Mastodon.Emoji[] | undefined
  poll: {
    active: boolean
    total: number
    options: {
      '1': string
      '2': string
      '3': string
      '4': string
      [key: string]: string
    }
    multiple: boolean
    expire:
      | '300'
      | '1800'
      | '3600'
      | '21600'
      | '86400'
      | '259200'
      | '604800'
      | string
  }
  attachments: {
    id: string
    url: string
    preview_url: string
    description: string
  }[]
  visibility: 'public' | 'unlisted' | 'private' | 'direct'
}

export type PostAction =
  | {
      type: 'text'
      payload: Partial<PostState['text']>
    }
  | {
      type: 'selection'
      payload: PostState['selection']
    }
  | {
      type: 'overlay'
      payload: PostState['overlay']
    }
  | {
      type: 'tag'
      payload: PostState['tag']
    }
  | {
      type: 'emojis'
      payload: PostState['emojis']
    }
  | {
      type: 'poll'
      payload: PostState['poll']
    }
  | {
      type: 'attachments/add'
      payload: {
        id: string
        url: string
        preview_url: string
        description: string
      }
    }
  | {
      type: 'attachments/remove'
      payload: {
        id: string
      }
    }
  | {
      type: 'visibility'
      payload: PostState['visibility']
    }

const postInitialState: PostState = {
  text: {
    count: 0,
    raw: '',
    formatted: undefined
  },
  selection: { start: 0, end: 0 },
  overlay: null,
  tag: undefined,
  emojis: undefined,
  poll: {
    active: false,
    total: 2,
    options: {
      '1': '',
      '2': '',
      '3': '',
      '4': ''
    },
    multiple: false,
    expire: '86400'
  },
  attachments: [],
  visibility:
    getLocalAccountPreferences(store.getState())[
      'posting:default:visibility'
    ] || 'public'
}
const postReducer = (state: PostState, action: PostAction): PostState => {
  switch (action.type) {
    case 'text':
      return { ...state, text: { ...state.text, ...action.payload } }
    case 'selection':
      return { ...state, selection: action.payload }
    case 'overlay':
      return { ...state, overlay: action.payload }
    case 'tag':
      return { ...state, tag: action.payload }
    case 'emojis':
      return { ...state, emojis: action.payload }
    case 'poll':
      return { ...state, poll: action.payload }
    case 'attachments/add':
      return { ...state, attachments: state.attachments.concat(action.payload) }
    case 'attachments/remove':
      return {
        ...state,
        attachments: state.attachments.filter(a => a.id !== action.payload.id)
      }
    case 'visibility':
      return { ...state, visibility: action.payload }
    default:
      throw new Error('Unexpected action')
  }
}

const PostToot: React.FC = () => {
  const navigation = useNavigation()

  const [hasKeyboard, setHasKeyboard] = useState(false)
  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', _keyboardDidShow)
    Keyboard.addListener('keyboardWillHide', _keyboardDidHide)

    // cleanup function
    return () => {
      Keyboard.removeListener('keyboardWillShow', _keyboardDidShow)
      Keyboard.removeListener('keyboardWillHide', _keyboardDidHide)
    }
  }, [])
  const _keyboardDidShow = () => {
    setHasKeyboard(true)
  }
  const _keyboardDidHide = () => {
    setHasKeyboard(false)
  }

  const [postState, postDispatch] = useReducer(postReducer, postInitialState)

  const tootPost = async () => {
    if (postState.text.count < 0) {
      Alert.alert('字数超限', '', [
        {
          text: '返回继续编辑'
        }
      ])
    } else {
      const formData = new FormData()
      formData.append('status', postState.text.raw)
      if (postState.poll.active) {
        Object.values(postState.poll.options)
          .filter(e => e.length)
          .forEach(e => {
            formData.append('poll[options][]', e)
          })
        formData.append('poll[expires_in]', postState.poll.expire)
        formData.append('poll[multiple]', postState.poll.multiple.toString())
      }
      if (postState.attachments.length > 0) {
        postState.attachments.forEach(attachment =>
          formData.append('media_ids[]', attachment.id)
        )
      }
      formData.append('visibility', postState.visibility)

      client({
        method: 'post',
        instance: 'local',
        endpoint: 'statuses',
        headers: {
          'Idempotency-Key': Date.now().toString() + Math.random().toString()
        },
        body: formData
      })
        .then(
          res => {
            if (res.body.id) {
              Alert.alert('发布成功', '', [
                {
                  text: '好的',
                  onPress: () => {
                    // clear homepage cache
                    navigation.goBack()
                  }
                }
              ])
            } else {
              Alert.alert('发布失败', '', [
                {
                  text: '返回重试'
                }
              ])
            }
          },
          error => {
            Alert.alert('发布失败', error.body, [
              {
                text: '返回重试'
              }
            ])
          }
        )
        .catch(() => {
          Alert.alert('发布失败', '', [
            {
              text: '返回重试'
            }
          ])
        })
    }
  }

  return (
    <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1 }}
        edges={hasKeyboard ? ['left', 'right'] : ['left', 'right', 'bottom']}
      >
        <Stack.Navigator>
          <Stack.Screen
            name='PostMain'
            options={{
              headerLeft: () => (
                <Pressable
                  onPress={() =>
                    Alert.alert('确认取消编辑？', '', [
                      { text: '继续编辑', style: 'cancel' },
                      {
                        text: '退出编辑',
                        style: 'destructive',
                        onPress: () => navigation.goBack()
                      }
                    ])
                  }
                >
                  <Text>退出编辑</Text>
                </Pressable>
              ),
              headerCenter: () => <></>,
              headerRight: () => (
                <Pressable onPress={async () => tootPost()}>
                  <Text>发嘟嘟</Text>
                </Pressable>
              )
            }}
          >
            {props => (
              <PostMain postState={postState} postDispatch={postDispatch} />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}
// ;(PostMain as any).whyDidYouRender = true

export default PostToot
