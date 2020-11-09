import { Feather } from '@expo/vector-icons'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import Autolinker from 'src/modules/autolinker'
import { useNavigation } from '@react-navigation/native'
import { debounce, differenceWith, isEqual } from 'lodash'
import { searchFetch } from '../common/searchFetch'
import { useQuery } from 'react-query'
import { FlatList } from 'react-native-gesture-handler'

const Stack = createNativeStackNavigator()

export interface Tag {
  type: 'url' | 'accounts' | 'hashtags'
  text: string
}

const Suggestion = React.memo(({ item, index }) => {
  return (
    <View key={index}>
      <Text>{item.acct ? item.acct : item.name}</Text>
    </View>
  )
})

const Suggestions = ({
  type,
  text
}: {
  type: 'mention' | 'hashtag'
  text: string
}) => {
  const { status, data } = useQuery(
    [
      'Search',
      { type: type === 'mention' ? 'accounts' : 'hashtags', term: text }
    ],
    searchFetch,
    { retry: false }
  )

  let content
  switch (status) {
    case 'success':
      content = data[type === 'mention' ? 'accounts' : 'hashtags'].length ? (
        <FlatList
          data={data[type === 'mention' ? 'accounts' : 'hashtags']}
          renderItem={({ item, index, separators }) => (
            <Suggestion item={item} index={index} />
          )}
        />
      ) : (
        <Text>空无一物</Text>
      )
      break
    case 'loading':
      content = <ActivityIndicator />
      break
    case 'error':
      content = <Text>搜索错误</Text>
      break
    default:
      content = <></>
  }

  return content
}

const PostTootMain = () => {
  const [viewHeight, setViewHeight] = useState(0)
  const [contentHeight, setContentHeight] = useState(0)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', _keyboardDidShow)
    Keyboard.addListener('keyboardDidHide', _keyboardDidHide)

    // cleanup function
    return () => {
      Keyboard.removeListener('keyboardDidShow', _keyboardDidShow)
      Keyboard.removeListener('keyboardDidHide', _keyboardDidHide)
    }
  }, [])
  const _keyboardDidShow = (props: any) => {
    setKeyboardHeight(props.endCoordinates.height)
  }

  const _keyboardDidHide = () => {
    setKeyboardHeight(0)
  }

  const [charCount, setCharCount] = useState(0)
  const [formattedText, setFormattedText] = useState<React.ReactNode>()
  const [suggestionsShown, setSuggestionsShown] = useState({
    display: false,
    tag: undefined
  })
  const debouncedSuggestions = useCallback(
    debounce(tag => setSuggestionsShown({ display: true, tag }), 300),
    []
  )
  let prevTags: Tag[] = []
  const onChangeText = useCallback(content => {
    const tags: Tag[] = []
    Autolinker.link(content, {
      email: false,
      phone: false,
      mention: 'mastodon',
      hashtag: 'twitter',
      replaceFn: props => {
        let type = props.getType()
        switch (type) {
          case 'mention':
            type = 'accounts'
            break
          case 'hashtag':
            type = 'hashtags'
            break
        }
        // @ts-ignore
        tags.push({ type: type, text: props.getMatchedText() })
        return
      }
    })

    const changedTag = differenceWith(prevTags, tags, isEqual)
    if (changedTag.length && tags.length !== 0) {
      if (changedTag[0].type !== 'url') {
        debouncedSuggestions(changedTag[0])
      }
    } else {
      setSuggestionsShown({ display: false, tag: undefined })
    }
    prevTags = tags
    let _content = content
    let contentLength: number = 0
    const children = []
    tags.forEach(tag => {
      const parts = _content.split(tag.text)
      const prevPart = parts.shift()
      children.push(prevPart)
      contentLength = contentLength + prevPart.length
      children.push(
        <Text style={{ color: 'red' }} key={Math.random()}>
          {tag.text}
        </Text>
      )
      switch (tag.type) {
        case 'url':
          contentLength = contentLength + 23
          break
        case 'accounts':
          contentLength =
            contentLength + tag.text.split(new RegExp('(@.*)@?'))[1].length
          break
        case 'hashtags':
          contentLength = contentLength + tag.text.length
          break
      }
      _content = parts.join()
    })
    children.push(_content)
    contentLength = contentLength + _content.length

    setFormattedText(React.createElement(Text, null, children))
    setCharCount(500 - contentLength)
  }, [])

  return (
    <View
      style={styles.main}
      onLayout={({ nativeEvent }) => setViewHeight(nativeEvent.layout.height)}
    >
      <View style={{ height: viewHeight - keyboardHeight }}>
        <TextInput
          style={[
            styles.textInput,
            {
              flex: suggestionsShown.display ? 0 : 1,
              minHeight: contentHeight + 14
            }
          ]}
          autoCapitalize='none'
          autoCorrect={false}
          autoFocus
          enablesReturnKeyAutomatically
          multiline
          placeholder='想说点什么'
          onChangeText={onChangeText}
          onContentSizeChange={({ nativeEvent }) => {
            setContentHeight(nativeEvent.contentSize.height)
          }}
          scrollEnabled
        >
          <Text>{formattedText}</Text>
        </TextInput>
        {suggestionsShown.display ? (
          <View style={[styles.suggestions]}>
            <Suggestions {...suggestionsShown.tag} />
          </View>
        ) : (
          <></>
        )}
        <Pressable style={styles.additions} onPress={() => Keyboard.dismiss()}>
          <Feather name='paperclip' size={24} />
          <Feather name='bar-chart-2' size={24} />
          <Feather name='eye-off' size={24} />
          <Text>{charCount}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const PostToot: React.FC = () => {
  const navigation = useNavigation()

  return (
    <Stack.Navigator>
      <Stack.Screen
        name='PostTootMain'
        component={PostTootMain}
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
            <Pressable>
              <Text>发嘟嘟</Text>
            </Pressable>
          )
        }}
      />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  main: {
    flex: 1
  },
  textInput: {
    backgroundColor: 'gray'
  },
  suggestions: {
    flex: 1,
    backgroundColor: 'lightyellow'
  },
  additions: {
    height: 44,
    backgroundColor: 'red',
    flexDirection: 'row'
  }
})

export default PostToot
