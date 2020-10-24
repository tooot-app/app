import React, { useEffect, useState } from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { Feather } from '@expo/vector-icons'

import Timeline from 'src/stacks/common/Timeline'

const Stack = createNativeStackNavigator()

export default function Notifications () {
  const [renderHeader, setRenderHeader] = useState(false)

  useEffect(() => {
    const nbr = setTimeout(() => setRenderHeader(true), 50)
    return
  }, [])

  return (
    <Stack.Navigator
      screenOptions={{
        statusBarAnimation: 'none',
        headerRight: () =>
          renderHeader ? (
            <Feather name='search' size={24} color='black' />
          ) : null,
        headerTitle: '通知'
      }}
    >
      <Stack.Screen name='Notifications'>
        {props => <Timeline endpoint='notifications' {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}
