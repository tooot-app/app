import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'

import Timeline from '@components/Timelines/Timeline'
import sharedScreens from '@screens/Shared/sharedScreens'
import { useSelector } from 'react-redux'
import { RootState } from '@root/store'
import { useTranslation } from 'react-i18next'

const Stack = createNativeStackNavigator()

const ScreenNotifications: React.FC = () => {
  const { t } = useTranslation()
  const localRegistered = useSelector(
    (state: RootState) => state.instances.local.url
  )

  return (
    <Stack.Navigator
      screenOptions={{
        headerTitle: t('notifications:heading'),
        headerHideShadow: true
      }}
    >
      <Stack.Screen name='Screen-Notifications-Root'>
        {() => (localRegistered ? <Timeline page='Notifications' /> : null)}
      </Stack.Screen>

      {sharedScreens(Stack)}
    </Stack.Navigator>
  )
}

export default ScreenNotifications
