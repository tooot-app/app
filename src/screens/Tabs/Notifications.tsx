import analytics from '@components/analytics'
import { HeaderCenter, HeaderRight } from '@components/Header'
import Timeline from '@components/Timeline'
import TimelineNotifications from '@components/Timeline/Notifications'
import navigationRef from '@helpers/navigationRef'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TabNotificationsStackParamList } from '@utils/navigation/navigators'
import usePopToTop from '@utils/navigation/usePopToTop'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import TabSharedRoot from './Shared/Root'

const Stack = createNativeStackNavigator<TabNotificationsStackParamList>()

const TabNotifications = React.memo(
  () => {
    const { t, i18n } = useTranslation('screenTabs')

    const screenOptionsRoot = useMemo(
      () => ({
        title: t('tabs.notifications.name'),
        ...(Platform.OS === 'android' && {
          headerCenter: () => <HeaderCenter content={t('tabs.notifications.name')} />
        }),
        headerRight: () => (
          <HeaderRight
            accessibilityLabel={t('notifications.filter.accessibilityLabel')}
            accessibilityHint={t('notifications.filter.accessibilityHint')}
            content='Filter'
            onPress={() => {
              analytics('notificationsfilter_tap')
              navigationRef.navigate('Screen-Actions', {
                type: 'notifications_filter'
              })
            }}
          />
        )
      }),
      [i18n.language]
    )

    const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Notifications' }]
    const children = useCallback(
      () => (
        <Timeline
          queryKey={queryKey}
          customProps={{
            renderItem: ({ item }) => (
              <TimelineNotifications notification={item} queryKey={queryKey} />
            )
          }}
        />
      ),
      []
    )

    usePopToTop()

    return (
      <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
        <Stack.Screen
          name='Tab-Notifications-Root'
          children={children}
          options={screenOptionsRoot}
        />
        {TabSharedRoot({ Stack })}
      </Stack.Navigator>
    )
  },
  () => true
)

export default TabNotifications
