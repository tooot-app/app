import analytics from '@components/analytics'
import { HeaderCenter, HeaderRight } from '@components/Header'
import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ScreenTabsParamList } from '@screens/Tabs'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import sharedScreens from './Shared/sharedScreens'

export type TabLocalProp = BottomTabScreenProps<
  ScreenTabsParamList,
  'Tab-Local'
>

const Stack = createNativeStackNavigator<Nav.TabLocalStackParamList>()

const TabLocal = React.memo(
  ({ navigation }: TabLocalProp) => {
    const { t, i18n } = useTranslation('screenTabs')

    const screenOptionsRoot = useMemo(
      () => ({
        headerTitle: t('tabs.local.name'),
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
      () => <Timeline queryKey={queryKey} customProps={{ renderItem }} />,
      []
    )

    return (
      <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
        <Stack.Screen
          name='Tab-Local-Root'
          options={screenOptionsRoot}
          children={children}
        />
        {sharedScreens(Stack as any)}
      </Stack.Navigator>
    )
  },
  () => true
)

export default TabLocal
