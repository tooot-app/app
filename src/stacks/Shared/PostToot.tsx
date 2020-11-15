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

import PostMain from './PostToot/PostMain'
import client from 'src/api/client'

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
  emojis: mastodon.Emoji[] | undefined
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

const postInitialState: PostState = {
  text: {
    count: 0,
    raw: '',
    formatted: undefined
  },
  selection: { start: 0, end: 0 },
  overlay: null,
  tag: undefined,
  emojis: undefined
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
                <Pressable
                  onPress={async () => {
                    if (postState.text.count < 0) {
                      Alert.alert('字数超限', '', [
                        {
                          text: '返回继续编辑'
                        }
                      ])
                    } else {
                      const res = await client({
                        method: 'post',
                        instance: 'local',
                        endpoint: 'statuses',
                        headers: {
                          'Idempotency-Key':
                            Date.now().toString() + Math.random().toString()
                        },
                        query: { status: postState.text.raw }
                      })
                      if (res.body.id) {
                        Alert.alert('发布成功', '', [
                          {
                            text: '好的',
                            onPress: () => navigation.goBack()
                          }
                        ])
                      } else {
                        Alert.alert('发布失败', '', [
                          {
                            text: '返回重试'
                          }
                        ])
                      }
                    }
                  }}
                >
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

export default PostToot
