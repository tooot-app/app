import React from 'react'
import { Button, View } from 'react-native'

export default function Base ({ navigation: { navigate } }) {
  return (
    <View>
      <Button title='登录' onPress={() => navigate('Me-Authentication')} />
    </View>
  )
}
