import React, { useEffect } from 'react'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'

import Timeline from '@components/Timelines/Timeline'
import sharedScreens from '@screens/Shared/sharedScreens'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@root/store'
import { useTranslation } from 'react-i18next'
import { updateNotification } from '@root/utils/slices/instancesSlice'

const Stack = createNativeStackNavigator()

const ScreenNotifications: React.FC = () => {
  const { t } = useTranslation()
  const localRegistered = useSelector(
    (state: RootState) => state.instances.local.url
  )

  // Clear notification unread, but keep the time
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(updateNotification({ unread: false }))
  }, [])

  return (
    <Stack.Navigator
      screenOptions={{ headerTitle: t('notifications:heading') }}
    >
      <Stack.Screen name='Screen-Notifications-Root'>
        {() => (localRegistered ? <Timeline page='Notifications' /> : null)}
      </Stack.Screen>

      {sharedScreens(Stack)}
    </Stack.Navigator>
  )
}

export default ScreenNotifications
