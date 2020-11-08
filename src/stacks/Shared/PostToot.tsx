import { Feather } from '@expo/vector-icons'
import React, { useCallback, useEffect, useState } from 'react'
import {
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
  }, [])
  const _keyboardDidShow = (props: any) => {
    setKeyboardHeight(props.endCoordinates.height)
  }

  const _keyboardDidHide = () => {
    setKeyboardHeight(0)
  }

  const [charCount, setCharCount] = useState(0)
  const [formattedText, setFormattedText] = useState<React.ReactNode>()
  let prevTags = []
  const onChangeText = useCallback(content => {
    const tags: string[] = []
    Autolinker.link(content, {
      email: true,
      phone: false,
      mention: 'mastodon',
      hashtag: 'twitter',
      replaceFn: props => {
        const tag = props.getMatchedText()
        tags.push(tag)
        return tag
      }
    })
    prevTags = tags

    let _content = content
    const children = []
    tags.forEach(tag => {
      const parts = _content.split(tag)
      children.push(parts.shift())
      children.push(
        <Text style={{ color: 'red' }} key={Math.random()}>
          {tag}
        </Text>
      )
      _content = parts.join(tag)
    })
    children.push(_content)

    setFormattedText(React.createElement(Text, null, children))
    setCharCount(content.length)
  }, [])

  return (
    <View
      style={styles.main}
      onLayout={({ nativeEvent }) => setViewHeight(nativeEvent.layout.height)}
    >
      <View style={{ height: viewHeight - keyboardHeight }}>
        <TextInput
          style={styles.textInput}
          autoCapitalize='none'
          autoFocus
          enablesReturnKeyAutomatically
          multiline
          placeholder='想说点什么'
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
    flex: 1,
    backgroundColor: 'gray'
  },
  additions: {
    height: 44,
    backgroundColor: 'red',
    flexDirection: 'row'
  }
})

export default PostToot
