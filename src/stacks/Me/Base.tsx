import React from 'react'
import { Button, View } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack'

import { ScreenMe } from '../Me'

export interface Props {
  navigation: StackNavigationProp<ScreenMe, 'Me-Base'>
}

const Base: React.FC<Props> = ({ navigation: { navigate } }) => {
  return (
    <View>
      <Button title='登录' onPress={() => navigate('Me-Authentication')} />
    </View>
  )
}

export default Base
