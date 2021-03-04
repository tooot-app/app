import { HeaderCenter } from '@components/Header'
import Timeline from '@components/Timeline'
import TimelineNotifications from '@components/Timeline/Notifications'
import sharedScreens from '@screens/Tabs/Shared/sharedScreens'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { useDispatch } from 'react-redux'

const Stack = createNativeStackNavigator<Nav.TabNotificationsStackParamList>()

const TabNotifications = React.memo(
  () => {
    const { t } = useTranslation()
    const dispatch = useDispatch()

    const screenOptions = useMemo(
      () => ({
        headerTitle: t('notifications:heading'),
        ...(Platform.OS === 'android' && {
          headerCenter: () => (
            <HeaderCenter content={t('notifications:heading')} />
          )
        }),
        headerHideShadow: true,
        headerTopInsetEnabled: false
      }),
      []
    )

    const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Notifications' }]
    const renderItem = useCallback(
      ({ item }) => (
        <TimelineNotifications notification={item} queryKey={queryKey} />
      ),
      []
    )
    const children = useCallback(
      () => <Timeline queryKey={queryKey} customProps={{ renderItem }} />,
      []
    )

    return (
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name='Tab-Notifications-Root' children={children} />
        {sharedScreens(Stack as any)}
      </Stack.Navigator>
    )
  },
  () => true
)

export default TabNotifications
