import React from 'react'
import { Alert, Pressable, Text } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { useNavigation } from '@react-navigation/native'

import PostMain from './PostToot/PostMain'

const Stack = createNativeStackNavigator()

const PostToot: React.FC = () => {
  const navigation = useNavigation()

  return (
    <Stack.Navigator>
      <Stack.Screen
        name='PostMain'
        component={PostMain}
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

export default PostToot
