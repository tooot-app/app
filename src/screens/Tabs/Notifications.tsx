import analytics from '@components/analytics'
import { HeaderCenter, HeaderRight } from '@components/Header'
import Timeline from '@components/Timeline'
import TimelineNotifications from '@components/Timeline/Notifications'
import { useNavigation } from '@react-navigation/native'
import sharedScreens from '@screens/Tabs/Shared/sharedScreens'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'

const Stack = createNativeStackNavigator<Nav.TabNotificationsStackParamList>()

const TabNotifications = React.memo(
  () => {
    const navigation = useNavigation()
    const { t, i18n } = useTranslation('screenTabs')

    const screenOptions = useMemo(
      () => ({
        headerHideShadow: true,
        headerTopInsetEnabled: false
      }),
      []
    )
    const screenOptionsRoot = useMemo(
      () => ({
        headerTitle: t('tabs.notifications.name'),
        ...(Platform.OS === 'android' && {
          headerCenter: () => (
            <HeaderCenter content={t('tabs.notifications.name')} />
          )
        }),
        headerRight: () => (
          <HeaderRight
            accessibilityLabel={t('notifications.filter.accessibilityLabel')}
            accessibilityHint={t('notifications.filter.accessibilityHint')}
            content='Filter'
            onPress={() => {
              analytics('notificationsfilter_tap')
              navigation.navigate('Screen-Actions', {
                type: 'notifications_filter'
              })
            }}
          />
        )
      }),
      [i18n.language]
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
        <Stack.Screen
          name='Tab-Notifications-Root'
          children={children}
          options={screenOptionsRoot}
        />
        {sharedScreens(Stack as any)}
      </Stack.Navigator>
    )
  },
  () => true
)

export default TabNotifications
