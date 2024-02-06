import { HeaderRight } from '@components/Header'
import Timeline from '@components/Timeline'
import TimelineNotifications from '@components/Timeline/Notifications'
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack'
import { TabNotificationsStackParamList } from '@utils/navigation/navigators'
import usePopToTop from '@utils/navigation/usePopToTop'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import TabShared from '../Shared'
import TabNotificationsFilters from './Filters'

const Stack = createNativeStackNavigator<TabNotificationsStackParamList>()

const Root: React.FC<
  NativeStackScreenProps<TabNotificationsStackParamList, 'Tab-Notifications-Root'>
> = ({ navigation }) => {
  const { t } = useTranslation('screenTabs')

  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Notifications' }]
  useEffect(() => {
    navigation.setOptions({
      title: t('tabs.notifications.name'),
      headerRight: () => (
        <HeaderRight
          accessibilityLabel={t('notifications.filters.accessibilityLabel')}
          accessibilityHint={t('notifications.filters.accessibilityHint')}
          content='filter'
          onPress={() => navigation.navigate('Tab-Notifications-Filters')}
        />
      )
    })
    navigation.setParams({ queryKey })
  }, [])

  return (
    <Timeline
      queryKey={queryKey}
      customProps={{
        renderItem: ({ item }) => <TimelineNotifications notification={item} queryKey={queryKey} />
      }}
    />
  )
}

const TabNotifications: React.FC = () => {
  usePopToTop('Tab-Notifications-Root')

  return (
    <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen name='Tab-Notifications-Root' component={Root} />
      <Stack.Screen
        name='Tab-Notifications-Filters'
        component={TabNotificationsFilters}
        options={{ presentation: 'modal', gestureEnabled: false }}
      />
      {TabShared(Stack)}
    </Stack.Navigator>
  )
}

export default TabNotifications
