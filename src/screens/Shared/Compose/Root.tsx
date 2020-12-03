import React, {
  createElement,
  Dispatch,
  useCallback,
  useEffect,
  useRef,
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
import ComposeEmojis from './Emojis'
import ComposePoll from './Poll'
import ComposeSuggestions from './Suggestions'
import { emojisFetch } from 'src/utils/fetches/emojisFetch'
import { PostAction, PostState } from 'src/screens/Shared/Compose'
import addAttachments from './addAttachments'
import ComposeAttachments from './Attachments'
import { useTheme } from 'src/utils/styles/ThemeManager'
import { StyleConstants } from 'src/utils/styles/constants'
import ComposeActions from './Actions'

export interface Props {
  postState: PostState
  postDispatch: Dispatch<PostAction>
}

const ComposeRoot: React.FC<Props> = ({ postState, postDispatch }) => {
  const { theme } = useTheme()
  useEffect(() => {
    ;(async () => {
      const { status } = await ImagePicker.requestCameraRollPermissionsAsync()
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!')
      }
    })()
  }, [])

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

  const textInputRef = useRef<TextInput>(null)

  const renderOverlay = (overlay: PostState['overlay']) => {
    switch (overlay) {
      case 'emojis':
        return (
          <View style={styles.emojis}>
            <ComposeEmojis
              textInputRef={textInputRef}
              onChangeText={onChangeText}
              postState={postState}
              postDispatch={postDispatch}
            />
          </View>
        )
      case 'suggestions':
        return (
          <View style={styles.suggestions}>
            <ComposeSuggestions
              onChangeText={onChangeText}
              postState={postState}
              postDispatch={postDispatch}
            />
          </View>
        )
    }
  }

  return (
    <View style={styles.base}>
      <ScrollView
        style={[styles.contentView]}
        alwaysBounceVertical={false}
        keyboardDismissMode='interactive'
        // child touch event not picked up
        keyboardShouldPersistTaps='always'
      >
        <TextInput
          style={[
            styles.textInput,
            {
              color: theme.primary
            }
          ]}
          autoCapitalize='none'
          autoCorrect={false}
          autoFocus
          enablesReturnKeyAutomatically
          multiline
          placeholder='想说点什么'
          placeholderTextColor={theme.secondary}
          onChangeText={content => onChangeText({ content })}
          onSelectionChange={({
            nativeEvent: {
              selection: { start, end }
            }
          }) => {
            postDispatch({ type: 'selection', payload: { start, end } })
          }}
          ref={textInputRef}
          scrollEnabled
        >
          <Text>{postState.text.formatted}</Text>
        </TextInput>

        {renderOverlay(postState.overlay)}

        {postState.attachments.length > 0 && (
          <View style={styles.attachments}>
            <ComposeAttachments
              postState={postState}
              postDispatch={postDispatch}
            />
          </View>
        )}
        {postState.poll.active && (
          <View style={styles.poll}>
            <ComposePoll postState={postState} postDispatch={postDispatch} />
          </View>
        )}
      </ScrollView>
      <ComposeActions
        textInputRef={textInputRef}
        postState={postState}
        postDispatch={postDispatch}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1
  },
  contentView: { flex: 1 },
  textInput: {
    fontSize: StyleConstants.Font.Size.M,
    marginTop: StyleConstants.Spacing.S,
    marginBottom: StyleConstants.Spacing.M,
    paddingLeft: StyleConstants.Spacing.Global.PagePadding,
    paddingRight: StyleConstants.Spacing.Global.PagePadding
  },
  attachments: {
    flex: 1,
    height: 100
  },
  poll: {
    flex: 1,
    padding: StyleConstants.Spacing.Global.PagePadding
  },
  suggestions: {
    flex: 1,
    backgroundColor: 'lightyellow'
  },
  emojis: {
    flex: 1
  }
})

export default ComposeRoot
