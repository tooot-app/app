import Timeline from '@components/Timelines/Timeline'
import sharedScreens from '@screens/Shared/sharedScreens'
import { getLocalActiveIndex } from '@utils/slices/instancesSlice'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { useSelector } from 'react-redux'

const Stack = createNativeStackNavigator<Nav.NotificationsStackParamList>()

const ScreenNotifications: React.FC = () => {
  const { t } = useTranslation()
  const localActiveIndex = useSelector(getLocalActiveIndex)

  return (
    <Stack.Navigator
      screenOptions={{
        headerTitle: t('notifications:heading'),
        headerHideShadow: true,
        headerTopInsetEnabled: false
      }}
    >
      <Stack.Screen name='Screen-Notifications-Root'>
        {() =>
          localActiveIndex !== null ? <Timeline page='Notifications' /> : null
        }
      </Stack.Screen>

      {sharedScreens(Stack)}
    </Stack.Navigator>
  )
}

export default ScreenNotifications
