import analytics from '@components/analytics'
import { HeaderCenter, HeaderRight } from '@components/Header'
import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {
  ScreenTabsScreenProps,
  TabLocalStackParamList
} from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import TabSharedRoot from './Shared/Root'

const Stack = createNativeStackNavigator<TabLocalStackParamList>()

const TabLocal = React.memo(
  ({ navigation }: ScreenTabsScreenProps<'Tab-Local'>) => {
    const { t, i18n } = useTranslation('screenTabs')

    const screenOptionsRoot = useMemo(
      () => ({
        title: t('tabs.local.name'),
        ...(Platform.OS === 'android' && {
          headerCenter: () => <HeaderCenter content={t('tabs.local.name')} />
        }),
        headerRight: () => (
          <HeaderRight
            accessibilityLabel={t('common.search.accessibilityLabel')}
            accessibilityHint={t('common.search.accessibilityHint')}
            content='Search'
            onPress={() => {
              analytics('search_tap', { page: 'Local' })
              navigation.navigate('Tab-Local', {
                screen: 'Tab-Shared-Search',
                params: { text: undefined }
              })
            }}
          />
        )
      }),
      [i18n.language]
    )

    const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Following' }]
    const renderItem = useCallback(
      ({ item }) => <TimelineDefault item={item} queryKey={queryKey} />,
      []
    )
    const children = useCallback(
      () => (
        <Timeline
          queryKey={queryKey}
          lookback='Following'
          customProps={{ renderItem }}
        />
      ),
      []
    )

    return (
      <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
        <Stack.Screen
          name='Tab-Local-Root'
          options={screenOptionsRoot}
          children={children}
        />
        {TabSharedRoot({ Stack })}
      </Stack.Navigator>
    )
  },
  () => true
)

export default TabLocal
