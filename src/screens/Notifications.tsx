import React from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'

import Timeline from 'src/components/Timelines/Timeline'
import sharedScreens from 'src/screens/Shared/sharedScreens'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'
import PleaseLogin from 'src/components/PleaseLogin'
import { useTranslation } from 'react-i18next'

const Stack = createNativeStackNavigator()

const ScreenNotifications: React.FC = () => {
  const { t } = useTranslation()
  const localRegistered = useSelector(
    (state: RootState) => state.instances.local.url
  )

  return (
    <Stack.Navigator
      screenOptions={{ headerTitle: t('headers.notifications') }}
    >
      <Stack.Screen name='Screen-Notifications-Root'>
        {() =>
          localRegistered ? <Timeline page='Notifications' /> : <PleaseLogin />
        }
      </Stack.Screen>

      {sharedScreens(Stack)}
    </Stack.Navigator>
  )
}

export default ScreenNotifications
