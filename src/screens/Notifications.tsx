import React, { useEffect, useState } from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { Feather } from '@expo/vector-icons'

import Timeline from 'src/components/Timelines/Timeline'
import sharedScreens from 'src/screens/Shared/sharedScreens'
import { useTheme } from 'src/utils/styles/ThemeManager'

const Stack = createNativeStackNavigator()

const ScreenNotifications: React.FC = () => {
  const { theme } = useTheme()

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
            <Feather name='search' size={24} color={theme.secondary} />
          ) : null,
        headerTitle: '通知',
        headerLargeTitle: true
      }}
    >
      <Stack.Screen name='Notifications'>
        {() => <Timeline page='Notifications' />}
      </Stack.Screen>

      {sharedScreens(Stack)}
    </Stack.Navigator>
  )
}

export default ScreenNotifications
