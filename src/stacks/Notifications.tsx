import React, { useEffect, useState } from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { Feather } from '@expo/vector-icons'

import Timeline from 'src/stacks/common/Timeline'
import sharedScreens from 'src/stacks/Shared/sharedScreens'

const Stack = createNativeStackNavigator()

const Notifications: React.FC = () => {
  const [renderHeader, setRenderHeader] = useState(false)

  useEffect(() => {
    const nbr = setTimeout(() => setRenderHeader(true), 50)
    return
  }, [])

  return (
    <Stack.Navigator
      screenOptions={{
        headerRight: () =>
          renderHeader ? (
            <Feather name='search' size={24} color='black' />
          ) : null,
        headerTitle: '通知'
      }}
    >
      <Stack.Screen name='Notifications'>
        {() => <Timeline page='Notifications' />}
      </Stack.Screen>

      {sharedScreens(Stack)}
    </Stack.Navigator>
  )
}

export default Notifications
