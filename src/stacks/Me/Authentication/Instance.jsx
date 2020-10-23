import React, { useState } from 'react'
import { Button, TextInput, View } from 'react-native'

export default function Instance ({ navigation }) {
  const [instance, onChangeInstance] = useState()

  return (
    <View>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
        onChangeText={text => onChangeInstance(text)}
        value={instance}
        autoCapitalize='none'
        autoCorrect={false}
        clearButtonMode='unless-editing'
        keyboardType='url'
        textContentType='URL'
        placeholder='输入服务器'
        placeholderTextColor='#888888'
      />
      <Button
        title='登录'
        onPress={() =>
          navigation.navigate('Me-Authentication-Webview', {
            instance: instance
          })
        }
      />
    </View>
  )
}
