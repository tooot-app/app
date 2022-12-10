import { HeaderRight } from '@components/Header'
import Timeline from '@components/Timeline'
import TimelineNotifications from '@components/Timeline/Notifications'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ScreenTabsScreenProps, TabNotificationsStackParamList } from '@utils/navigation/navigators'
import usePopToTop from '@utils/navigation/usePopToTop'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React from 'react'
import { useTranslation } from 'react-i18next'
import TabShared from '../Shared'
import TabNotificationsFilters from './Filters'

const Stack = createNativeStackNavigator<TabNotificationsStackParamList>()

const Root = () => {
  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Notifications' }]
  return (
    <Timeline
      queryKey={queryKey}
      customProps={{
        renderItem: ({ item }) => <TimelineNotifications notification={item} queryKey={queryKey} />
      }}
    />
  )
}

const TabNotifications = ({ navigation }: ScreenTabsScreenProps<'Tab-Notifications'>) => {
  const { t } = useTranslation('screenTabs')

  usePopToTop()

  return (
    <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen
        name='Tab-Notifications-Root'
        component={Root}
        options={{
          title: t('tabs.notifications.name'),
          headerRight: () => (
            <HeaderRight
              accessibilityLabel={t('notifications.filters.accessibilityLabel')}
              accessibilityHint={t('notifications.filters.accessibilityHint')}
              content='Filter'
              onPress={() =>
                navigation.navigate('Tab-Notifications', { screen: 'Tab-Notifications-Filters' })
              }
            />
          )
        }}
      />
      <Stack.Screen
        name='Tab-Notifications-Filters'
        component={TabNotificationsFilters}
        options={{ presentation: 'modal', gestureEnabled: false }}
      />
      {TabShared({ Stack })}
    </Stack.Navigator>
  )
}

export default TabNotifications
