import React, {
  createElement,
  Dispatch,
  useCallback,
  useEffect,
  useState
} from 'react'
import {
  ActionSheetIOS,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { useQuery } from 'react-query'
import { Feather } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { debounce, differenceWith, isEqual } from 'lodash'

import Autolinker from 'src/modules/autolinker'
import PostEmojis from './PostEmojis'
import PostPoll from './PostPoll'
import PostSuggestions from './PostSuggestions'
import { emojisFetch } from 'src/utils/fetches/emojisFetch'
import { PostAction, PostState } from 'src/screens/Shared/Compose'
import addAttachments from './addAttachments'
import PostAttachments from './PostAttachments'

export interface Props {
  postState: PostState
  postDispatch: Dispatch<PostAction>
}

const PostMain: React.FC<Props> = ({ postState, postDispatch }) => {
  useEffect(() => {
    ;(async () => {
      const { status } = await ImagePicker.requestCameraRollPermissionsAsync()
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!')
      }
    })()
  }, [])

  const [editorMinHeight, setEditorMinHeight] = useState(0)

  const { data: emojisData } = useQuery(['Emojis'], emojisFetch)
  useEffect(() => {
    if (emojisData && emojisData.length) {
      postDispatch({ type: 'emojis', payload: emojisData })
    }
  }, [emojisData])

  const debouncedSuggestions = useCallback(
    debounce(tag => {
      postDispatch({ type: 'overlay', payload: 'suggestions' })
      postDispatch({ type: 'tag', payload: tag })
    }, 500),
    []
  )
  let prevTags: PostState['tag'][] = []
  const onChangeText = useCallback(({ content, disableDebounce }) => {
    const tags: PostState['tag'][] = []
    Autolinker.link(content, {
      email: false,
      phone: false,
      mention: 'mastodon',
      hashtag: 'twitter',
      replaceFn: props => {
        const type = props.getType()
        let newType: 'url' | 'accounts' | 'hashtags'
        switch (type) {
          case 'mention':
            newType = 'accounts'
            break
          case 'hashtag':
            newType = 'hashtags'
            break
          default:
            newType = 'url'
            break
        }
        tags.push({
          type: newType,
          text: props.getMatchedText(),
          offset: props.getOffset()
        })
        return
      }
    })

    const changedTag = differenceWith(prevTags, tags, isEqual)
    // quick delete causes flicking of suggestion box
    if (
      changedTag.length > 0 &&
      tags.length > 0 &&
      content.length > 0 &&
      !disableDebounce
    ) {
      console.log('changedTag length')
      console.log(changedTag.length)
      console.log('tags length')
      console.log(tags.length)
      console.log('changed Tag')
      console.log(changedTag)
      if (changedTag[0]!.type !== 'url') {
        debouncedSuggestions(changedTag[0])
      }
    } else {
      postDispatch({ type: 'overlay', payload: null })
      postDispatch({ type: 'tag', payload: undefined })
    }
    prevTags = tags
    let _content = content
    let contentLength: number = 0
    const children = []
    tags.forEach(tag => {
      const parts = _content.split(tag!.text)
      const prevPart = parts.shift()
      children.push(prevPart)
      contentLength = contentLength + prevPart.length
      children.push(
        <Text style={{ color: 'red' }} key={Math.random()}>
          {tag!.text}
        </Text>
      )
      switch (tag!.type) {
        case 'url':
          contentLength = contentLength + 23
          break
        case 'accounts':
          contentLength =
            contentLength + tag!.text.split(new RegExp('(@.*)@?'))[1].length
          break
        case 'hashtags':
          contentLength = contentLength + tag!.text.length
          break
      }
      _content = parts.join()
    })
    children.push(_content)
    contentLength = contentLength + _content.length

    postDispatch({
      type: 'text',
      payload: {
        count: 500 - contentLength,
        raw: content,
        formatted: createElement(Text, null, children)
      }
    })
  }, [])

  const getVisibilityIcon = () => {
    switch (postState.visibility) {
      case 'public':
        return 'globe'
      case 'unlisted':
        return 'unlock'
      case 'private':
        return 'lock'
      case 'direct':
        return 'mail'
    }
  }

  return (
    <View style={styles.base}>
      <ScrollView
        style={styles.contentView}
        alwaysBounceVertical={false}
        keyboardDismissMode='interactive'
      >
        <TextInput
          style={[
            styles.textInput
            // {
            //   flex: postState.overlay ? 0 : 1,
            //   minHeight: editorMinHeight + 14
            // }
          ]}
          autoCapitalize='none'
          autoCorrect={false}
          autoFocus
          enablesReturnKeyAutomatically
          multiline
          placeholder='想说点什么'
          onChangeText={content => onChangeText({ content })}
          onContentSizeChange={({ nativeEvent }) => {
            setEditorMinHeight(nativeEvent.contentSize.height)
          }}
          onSelectionChange={({
            nativeEvent: {
              selection: { start, end }
            }
          }) => {
            postDispatch({ type: 'selection', payload: { start, end } })
          }}
          scrollEnabled
        >
          <Text>{postState.text.formatted}</Text>
        </TextInput>
        {postState.attachments.length > 0 && (
          <View style={styles.attachments}>
            <PostAttachments
              postState={postState}
              postDispatch={postDispatch}
            />
          </View>
        )}
        {postState.poll.active && (
          <View style={styles.poll}>
            <PostPoll postState={postState} postDispatch={postDispatch} />
          </View>
        )}
        {postState.overlay === 'suggestions' ? (
          <View style={styles.suggestions}>
            <PostSuggestions
              onChangeText={onChangeText}
              postState={postState}
              postDispatch={postDispatch}
            />
          </View>
        ) : (
          <></>
        )}
        {postState.overlay === 'emojis' ? (
          <View style={styles.emojis}>
            <PostEmojis
              onChangeText={onChangeText}
              postState={postState}
              postDispatch={postDispatch}
            />
          </View>
        ) : (
          <></>
        )}
      </ScrollView>
      <Pressable style={styles.additions} onPress={() => Keyboard.dismiss()}>
        <Feather
          name='paperclip'
          size={24}
          color={postState.poll.active ? 'gray' : 'black'}
          onPress={async () =>
            !postState.poll.active &&
            (await addAttachments({ postState, postDispatch }))
          }
        />
        <Feather
          name='bar-chart-2'
          size={24}
          color={postState.attachments.length > 0 ? 'gray' : 'black'}
          onPress={() =>
            postState.attachments.length === 0 &&
            postDispatch({
              type: 'poll',
              payload: { ...postState.poll, active: !postState.poll.active }
            })
          }
        />
        <Feather
          name={getVisibilityIcon()}
          size={24}
          onPress={() =>
            ActionSheetIOS.showActionSheetWithOptions(
              {
                options: ['公开', '不公开', '仅关注着', '私信', '取消'],
                cancelButtonIndex: 4
              },
              buttonIndex => {
                switch (buttonIndex) {
                  case 0:
                    postDispatch({ type: 'visibility', payload: 'public' })
                    break
                  case 1:
                    postDispatch({ type: 'visibility', payload: 'unlisted' })
                    break
                  case 2:
                    postDispatch({ type: 'visibility', payload: 'private' })
                    break
                  case 3:
                    postDispatch({ type: 'visibility', payload: 'direct' })
                    break
                }
              }
            )
          }
        />
        <Feather
          name='smile'
          size={24}
          color={postState.emojis?.length ? 'black' : 'white'}
          onPress={() => {
            if (postState.emojis?.length && postState.overlay === null) {
              postDispatch({ type: 'overlay', payload: 'emojis' })
            }
          }}
        />
        <Text>{postState.text.count}</Text>
      </Pressable>
    </View>
  )
}

// (PostSuggestions as any).whyDidYouRender = true,
// (PostPoll as any).whyDidYouRender = true,
// (PostEmojis as any).whyDidYouRender = true

const styles = StyleSheet.create({
  base: {
    flex: 1
  },
  contentView: {
    flex: 1,
    backgroundColor: 'gray'
  },
  textInput: {
    backgroundColor: 'lightgray',
    paddingBottom: 20
  },
  attachments: {
    flex: 1,
    height: 100
  },
  poll: {
    height: 100
  },
  suggestions: {
    flex: 1,
    backgroundColor: 'lightyellow'
  },
  emojis: {
    flex: 1,
    backgroundColor: 'lightblue'
  },
  additions: {
    height: 44,
    backgroundColor: 'red',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  }
})

export default PostMain
