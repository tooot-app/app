import React, { ReactNode, useEffect, useReducer, useState } from 'react'
import { Alert, Keyboard, KeyboardAvoidingView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { useNavigation } from '@react-navigation/native'

import { store } from 'src/store'
import ComposeRoot from './Compose/Root'
import client from 'src/api/client'
import { getLocalAccountPreferences } from 'src/utils/slices/instancesSlice'
import { HeaderLeft, HeaderRight } from 'src/components/Header'

const Stack = createNativeStackNavigator()

export type PostState = {
  text: {
    count: number
    raw: string
    formatted: ReactNode
  }
  selection: { start: number; end: number }
  tag:
    | {
        type: 'url' | 'accounts' | 'hashtags'
        text: string
        offset: number
      }
    | undefined
  emoji: {
    active: boolean
    emojis: { title: string; data: Mastodon.Emoji[] }[] | undefined
  }
  poll: {
    active: boolean
    total: number
    options: {
      '1': string | undefined
      '2': string | undefined
      '3': string | undefined
      '4': string | undefined
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
  attachments: Mastodon.Attachment[]
  attachmentUploadProgress: { progress: number; aspect: number } | undefined
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
      type: 'tag'
      payload: PostState['tag']
    }
  | {
      type: 'emoji'
      payload: PostState['emoji']
    }
  | {
      type: 'poll'
      payload: PostState['poll']
    }
  | {
      type: 'attachments'
      payload: PostState['attachments']
    }
  | {
      type: 'attachmentUploadProgress'
      payload: PostState['attachmentUploadProgress']
    }
  | {
      type: 'attachmentEdit'
      payload: Mastodon.Attachment & { local_url?: string }
    }
  | {
      type: 'visibility'
      payload: PostState['visibility']
    }

const postInitialState: PostState = {
  text: {
    count: 500,
    raw: '',
    formatted: undefined
  },
  selection: { start: 0, end: 0 },
  tag: undefined,
  emoji: { active: false, emojis: undefined },
  poll: {
    active: false,
    total: 2,
    options: {
      '1': undefined,
      '2': undefined,
      '3': undefined,
      '4': undefined
    },
    multiple: false,
    expire: '86400'
  },
  attachments: [],
  attachmentUploadProgress: undefined,
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
    case 'tag':
      return { ...state, tag: action.payload }
    case 'emoji':
      return { ...state, emoji: action.payload }
    case 'poll':
      return { ...state, poll: action.payload }
    case 'attachments':
      return { ...state, attachments: action.payload }
    case 'attachmentUploadProgress':
      return { ...state, attachmentUploadProgress: action.payload }
    case 'attachmentEdit':
      return {
        ...state,
        attachments: state.attachments.map(attachment =>
          attachment.id === action.payload.id ? action.payload : attachment
        )
      }
    case 'visibility':
      return { ...state, visibility: action.payload }
    default:
      throw new Error('Unexpected action')
  }
}

const Compose: React.FC = () => {
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
          .filter(e => e?.length)
          .forEach(e => formData.append('poll[options][]', e!))
        formData.append('poll[expires_in]', postState.poll.expire)
        formData.append('poll[multiple]', postState.poll.multiple.toString())
      }

      if (postState.attachments.length) {
        postState.attachments.forEach(e =>
          formData.append('media_ids[]', e!.id)
        )
      }

      formData.append('visibility', postState.visibility)

      client({
        method: 'post',
        instance: 'local',
        url: 'statuses',
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
                <HeaderLeft
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
                  text='退出编辑'
                />
              ),
              headerCenter: () => <></>,
              headerRight: () => (
                <HeaderRight
                  onPress={async () => tootPost()}
                  text='发嘟嘟'
                  disabled={
                    postState.text.raw.length < 1 || postState.text.count < 0
                  }
                />
              )
            }}
          >
            {() => (
              <ComposeRoot postState={postState} postDispatch={postDispatch} />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

export default Compose
