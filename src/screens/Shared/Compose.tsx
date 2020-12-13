import React, {
  createContext,
  createRef,
  Dispatch,
  ReactNode,
  RefObject,
  useEffect,
  useReducer,
  useState
} from 'react'
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { useNavigation } from '@react-navigation/native'
import sha256 from 'crypto-js/sha256'

import { store } from 'src/store'
import ComposeRoot from './Compose/Root'
import client from 'src/api/client'
import { getLocalAccountPreferences } from 'src/utils/slices/instancesSlice'
import { HeaderLeft, HeaderRight } from 'src/components/Header'
import { StyleConstants } from 'src/utils/styles/constants'
import { useTheme } from 'src/utils/styles/ThemeManager'
import formatText from './Compose/formatText'

const Stack = createNativeStackNavigator()

export type ComposeState = {
  spoiler: {
    active: boolean
    count: number
    raw: string
    formatted: ReactNode
    selection: { start: number; end: number }
  }
  text: {
    count: number
    raw: string
    formatted: ReactNode
    selection: { start: number; end: number }
  }
  tag?: {
    type: 'url' | 'accounts' | 'hashtags'
    text: string
    offset: number
    length: number
  }
  emoji: {
    active: boolean
    emojis: { title: string; data: Mastodon.Emoji[] }[] | undefined
  }
  poll: {
    active: boolean
    total: number
    options: {
      '0': string | undefined
      '1': string | undefined
      '2': string | undefined
      '3': string | undefined
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
    sensitive: boolean
    uploads: (Mastodon.Attachment & { local_url?: string })[]
  }
  attachmentUploadProgress?: { progress: number; aspect?: number }
  visibility: 'public' | 'unlisted' | 'private' | 'direct'
  visibilityLock: boolean
  replyToStatus?: Mastodon.Status
  textInputFocus: {
    current: 'text' | 'spoiler'
    refs: { text: RefObject<TextInput>; spoiler: RefObject<TextInput> }
  }
}

export type PostAction =
  | {
      type: 'spoiler'
      payload: Partial<ComposeState['spoiler']>
    }
  | {
      type: 'text'
      payload: Partial<ComposeState['text']>
    }
  | {
      type: 'tag'
      payload: ComposeState['tag']
    }
  | {
      type: 'emoji'
      payload: ComposeState['emoji']
    }
  | {
      type: 'poll'
      payload: Partial<ComposeState['poll']>
    }
  | {
      type: 'attachments'
      payload: Partial<ComposeState['attachments']>
    }
  | {
      type: 'attachmentUploadProgress'
      payload: ComposeState['attachmentUploadProgress']
    }
  | {
      type: 'attachmentEdit'
      payload: Mastodon.Attachment & { local_url?: string }
    }
  | {
      type: 'visibility'
      payload: ComposeState['visibility']
    }
  | {
      type: 'textInputFocus'
      payload: Partial<ComposeState['textInputFocus']>
    }

const composeInitialState: ComposeState = {
  spoiler: {
    active: false,
    count: 0,
    raw: '',
    formatted: undefined,
    selection: { start: 0, end: 0 }
  },
  text: {
    count: 0,
    raw: '',
    formatted: undefined,
    selection: { start: 0, end: 0 }
  },
  tag: undefined,
  emoji: { active: false, emojis: undefined },
  poll: {
    active: false,
    total: 2,
    options: {
      '0': undefined,
      '1': undefined,
      '2': undefined,
      '3': undefined
    },
    multiple: false,
    expire: '86400'
  },
  attachments: { sensitive: false, uploads: [] },
  attachmentUploadProgress: undefined,
  visibility:
    getLocalAccountPreferences(store.getState())[
      'posting:default:visibility'
    ] || 'public',
  visibilityLock: false,
  replyToStatus: undefined,
  textInputFocus: {
    current: 'text',
    refs: { text: createRef(), spoiler: createRef() }
  }
}
const composeExistingState = ({
  type,
  incomingStatus
}: {
  type: 'reply' | 'conversation' | 'edit'
  incomingStatus: Mastodon.Status
}): ComposeState => {
  switch (type) {
    case 'edit':
      return {
        ...composeInitialState,
        ...(incomingStatus.spoiler_text?.length && {
          spoiler: {
            active: true,
            count: incomingStatus.spoiler_text.length,
            raw: incomingStatus.spoiler_text,
            formatted: incomingStatus.spoiler_text,
            selection: { start: 0, end: 0 }
          }
        }),
        text: {
          count: incomingStatus.text!.length,
          raw: incomingStatus.text!,
          formatted: undefined,
          selection: { start: 0, end: 0 }
        },
        ...(incomingStatus.poll && {
          poll: {
            active: true,
            total: incomingStatus.poll.options.length,
            options: {
              '0': incomingStatus.poll.options[0].title || undefined,
              '1': incomingStatus.poll.options[1].title || undefined,
              '2': incomingStatus.poll.options[2].title || undefined,
              '3': incomingStatus.poll.options[3].title || undefined
            },
            multiple: incomingStatus.poll.multiple,
            expire: '86400' // !!!
          }
        }),
        ...(incomingStatus.media_attachments && {
          attachments: {
            sensitive: incomingStatus.sensitive,
            uploads: incomingStatus.media_attachments
          }
        }),
        visibility: incomingStatus.visibility
      }
    case 'reply':
    case 'conversation':
      const actualStatus = incomingStatus.reblog || incomingStatus
      const allMentions = actualStatus.mentions.map(
        mention => `@${mention.acct}`
      )
      let replyPlaceholder = allMentions.join(' ')
      if (replyPlaceholder.length === 0) {
        replyPlaceholder = `@${actualStatus.account.acct} `
      } else {
        replyPlaceholder = replyPlaceholder + ' '
      }
      return {
        ...composeInitialState,
        text: {
          count: replyPlaceholder.length,
          raw: replyPlaceholder,
          formatted: undefined,
          selection: { start: 0, end: 0 }
        },
        ...(type === 'conversation' && {
          visibility: 'direct',
          visibilityLock: true
        }),
        replyToStatus: incomingStatus.reblog || incomingStatus
      }
  }
}
const postReducer = (state: ComposeState, action: PostAction): ComposeState => {
  switch (action.type) {
    case 'spoiler':
      return { ...state, spoiler: { ...state.spoiler, ...action.payload } }
    case 'text':
      return { ...state, text: { ...state.text, ...action.payload } }
    case 'tag':
      return { ...state, tag: action.payload }
    case 'emoji':
      return { ...state, emoji: action.payload }
    case 'poll':
      return { ...state, poll: { ...state.poll, ...action.payload } }
    case 'attachments':
      return {
        ...state,
        attachments: { ...state.attachments, ...action.payload }
      }
    case 'attachmentUploadProgress':
      return { ...state, attachmentUploadProgress: action.payload }
    case 'attachmentEdit':
      return {
        ...state,
        attachments: {
          ...state.attachments,
          uploads: state.attachments.uploads.map(upload =>
            upload.id === action.payload.id ? action.payload : upload
          )
        }
      }
    case 'visibility':
      return { ...state, visibility: action.payload }
    case 'textInputFocus':
      return {
        ...state,
        textInputFocus: { ...state.textInputFocus, ...action.payload }
      }
    default:
      throw new Error('Unexpected action')
  }
}

type ContextType = {
  composeState: ComposeState
  composeDispatch: Dispatch<PostAction>
}
export const ComposeContext = createContext<ContextType>({} as ContextType)

export interface Props {
  route: {
    params:
      | {
          type?: 'reply' | 'conversation' | 'edit'
          incomingStatus: Mastodon.Status
        }
      | undefined
  }
}

const Compose: React.FC<Props> = ({ route: { params } }) => {
  const navigation = useNavigation()
  const { theme } = useTheme()

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

  const [composeState, composeDispatch] = useReducer(
    postReducer,
    params?.type && params?.incomingStatus
      ? composeExistingState({
          type: params.type,
          incomingStatus: params.incomingStatus
        })
      : composeInitialState
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    switch (params?.type) {
      case 'edit':
        if (params.incomingStatus.spoiler_text) {
          formatText({
            textInput: 'spoiler',
            composeDispatch,
            content: params.incomingStatus.spoiler_text,
            disableDebounce: true
          })
        }
        formatText({
          textInput: 'text',
          composeDispatch,
          content: params.incomingStatus.text!,
          disableDebounce: true
        })
        break
      case 'reply':
      case 'conversation':
        const actualStatus =
          params.incomingStatus.reblog || params.incomingStatus
        const allMentions = actualStatus.mentions.map(
          mention => `@${mention.acct}`
        )
        let replyPlaceholder = allMentions.join(' ')
        if (replyPlaceholder.length === 0) {
          replyPlaceholder = `@${actualStatus.account.acct} `
        } else {
          replyPlaceholder = replyPlaceholder + ' '
        }
        formatText({
          textInput: 'text',
          composeDispatch,
          content: replyPlaceholder,
          disableDebounce: true
        })
        break
    }
  }, [params?.type])

  const tootPost = async () => {
    setIsSubmitting(true)
    if (composeState.text.count < 0) {
      Alert.alert('字数超限', '', [
        {
          text: '返回继续编辑'
        }
      ])
    } else {
      const formData = new FormData()

      if (params?.type === 'conversation' || params?.type === 'reply') {
        formData.append('in_reply_to_id', composeState.replyToStatus!.id)
      }

      if (composeState.spoiler.active) {
        formData.append('spoiler_text', composeState.spoiler.raw)
      }

      formData.append('status', composeState.text.raw)

      if (composeState.poll.active) {
        Object.values(composeState.poll.options)
          .filter(e => e?.length)
          .forEach(e => formData.append('poll[options][]', e!))
        formData.append('poll[expires_in]', composeState.poll.expire)
        formData.append('poll[multiple]', composeState.poll.multiple.toString())
      }

      if (composeState.attachments.uploads.length) {
        formData.append(
          'sensitive',
          composeState.attachments.sensitive.toString()
        )
        composeState.attachments.uploads.forEach(e =>
          formData.append('media_ids[]', e!.id)
        )
      }

      formData.append('visibility', composeState.visibility)

      client({
        method: 'post',
        instance: 'local',
        url: 'statuses',
        headers: {
          'Idempotency-Key': sha256(
            composeState.spoiler.raw +
              composeState.text.raw +
              composeState.poll.options['0'] +
              composeState.poll.options['1'] +
              composeState.poll.options['2'] +
              composeState.poll.options['3'] +
              composeState.poll.multiple +
              composeState.poll.expire +
              composeState.attachments.sensitive +
              composeState.attachments.uploads.map(upload => upload.id) +
              composeState.visibility
          ).toString()
        },
        body: formData
      })
        .then(
          res => {
            if (res.body.id) {
              setIsSubmitting(false)
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
              setIsSubmitting(false)
              Alert.alert('发布失败', '', [
                {
                  text: '返回重试'
                }
              ])
            }
          },
          error => {
            setIsSubmitting(false)
            Alert.alert('发布失败', error.body, [
              {
                text: '返回重试'
              }
            ])
          }
        )
        .catch(() => {
          setIsSubmitting(false)
          Alert.alert('发布失败', '', [
            {
              text: '返回重试'
            }
          ])
        })
    }
  }

  const totalTextCount =
    (composeState.spoiler.active ? composeState.spoiler.count : 0) +
    composeState.text.count
  // doesn't work
  const rawCount = composeState.text.raw.length

  const postButtonText = {
    conversation: '回复私信',
    reply: '发布回复',
    edit: '发嘟嘟'
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
              headerCenter: () => (
                <Text
                  style={[
                    styles.count,
                    {
                      color:
                        totalTextCount > 500 ? theme.error : theme.secondary
                    }
                  ]}
                >
                  {totalTextCount} / 500
                </Text>
              ),
              headerRight: () =>
                isSubmitting ? (
                  <ActivityIndicator />
                ) : (
                  <HeaderRight
                    onPress={async () => tootPost()}
                    text={params?.type ? postButtonText[params.type] : '发嘟嘟'}
                    disabled={rawCount < 1 || totalTextCount > 500}
                  />
                )
            }}
          >
            {() => (
              <ComposeContext.Provider
                value={{ composeState, composeDispatch }}
              >
                <ComposeRoot />
              </ComposeContext.Provider>
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  count: {
    textAlign: 'center',
    fontSize: StyleConstants.Font.Size.M
  }
})

export default Compose
