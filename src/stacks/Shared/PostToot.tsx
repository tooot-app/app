import { Feather } from '@expo/vector-icons'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import Autolinker, { HtmlTag } from 'autolinker'

const Stack = createNativeStackNavigator()

const PostTootMain = () => {
  const [viewHeight, setViewHeight] = useState(0)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', _keyboardDidShow)
    Keyboard.addListener('keyboardDidHide', _keyboardDidHide)

    // cleanup function
    return () => {
      Keyboard.removeListener('keyboardDidShow', _keyboardDidShow)
      Keyboard.removeListener('keyboardDidHide', _keyboardDidHide)
    }
  })
  const _keyboardDidShow = (props: any) => {
    setKeyboardHeight(props.endCoordinates.height)
  }

  const _keyboardDidHide = () => {
    setKeyboardHeight(0)
  }

  const [charCount, setCharCount] = useState(0)
  const [formattedText, setFormattedText] = useState<React.ReactNode>()
  const onChangeText = useCallback(content => {
    const tags: string[] = []
    Autolinker.link(content, {
      email: false,
      phone: false,
      mention: 'twitter',
      hashtag: 'twitter',
      replaceFn: props => {
        const tag = props.getMatchedText()
        tags.push(tag)
        return tag
      }
    })

    let _content = content
    const children = []
    tags.forEach(tag => {
      const parts = _content.split(tag)
      children.push(parts.shift())
      children.push(<Text style={{ color: 'red' }}>{tag}</Text>)
      _content = parts.join(tag)
    })
    children.push(_content)

    setFormattedText(React.createElement(Text, null, children))
    setCharCount(content.length)
  }, [])

  return (
    <View
      style={styles.main}
      onLayout={({ nativeEvent }) => {
        setViewHeight(nativeEvent.layout.height)
      }}
    >
      <TextInput
        style={[styles.textInput, { height: viewHeight - keyboardHeight - 44 }]}
        autoCapitalize='none'
        autoFocus
        enablesReturnKeyAutomatically
        multiline
        placeholder='想说点什么'
        // value={rawText}
        onChangeText={onChangeText}
        scrollEnabled
      >
        <Text>{formattedText}</Text>
      </TextInput>
      <Pressable style={styles.additions} onPress={() => Keyboard.dismiss()}>
        <Feather name='paperclip' size={24} />
        <Feather name='bar-chart-2' size={24} />
        <Feather name='eye-off' size={24} />
        <Text>{charCount}</Text>
      </Pressable>
    </View>
  )
}

const PostToot: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='PostTootMain'
        component={PostTootMain}
        options={{
          headerLeft: () => <Text>取消</Text>,
          headerCenter: () => <></>,
          headerRight: () => <Text>发嘟嘟</Text>
        }}
      />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  main: {
    width: '100%',
    height: '100%'
  },
  textInput: {
    backgroundColor: 'gray'
  },
  additions: {
    height: 44,
    backgroundColor: 'red',
    flexDirection: 'row'
  }
})

export default PostToot
