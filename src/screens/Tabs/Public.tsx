import { HeaderRight } from '@components/Header'
import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import SegmentedControl from '@react-native-community/segmented-control'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ScreenTabsScreenProps, TabPublicStackParamList } from '@utils/navigation/navigators'
import usePopToTop from '@utils/navigation/usePopToTop'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions } from 'react-native'
import { TabView } from 'react-native-tab-view'
import TabShared from './Shared'

const Stack = createNativeStackNavigator<TabPublicStackParamList>()

const TabPublic = React.memo(
  ({ navigation }: ScreenTabsScreenProps<'Tab-Public'>) => {
    const { t, i18n } = useTranslation('screenTabs')
    const { mode, theme } = useTheme()

    const [segment, setSegment] = useState(0)
    const pages: {
      title: string
      key: Extract<App.Pages, 'Local' | 'LocalPublic'>
    }[] = [
      {
        title: t('tabs.public.segments.left'),
        key: 'LocalPublic'
      },
      {
        title: t('tabs.public.segments.right'),
        key: 'Local'
      }
    ]
    const screenOptionsRoot = useMemo(
      () => ({
        headerTitle: () => (
          <SegmentedControl
            appearance={mode}
            values={pages.map(p => p.title)}
            selectedIndex={segment}
            onChange={({ nativeEvent }) => setSegment(nativeEvent.selectedSegmentIndex)}
            style={{ flexBasis: '65%' }}
          />
        ),
        headerRight: () => (
          <HeaderRight
            accessibilityLabel={t('common.search.accessibilityLabel')}
            accessibilityHint={t('common.search.accessibilityHint')}
            content='Search'
            onPress={() =>
              navigation.navigate('Tab-Public', {
                screen: 'Tab-Shared-Search',
                params: { text: undefined }
              })
            }
          />
        )
      }),
      [theme, segment, i18n.language]
    )

    const routes = pages.map(p => ({ key: p.key }))

    const renderScene = useCallback(
      ({
        route: { key: page }
      }: {
        route: {
          key: Extract<App.Pages, 'Local' | 'LocalPublic'>
        }
      }) => {
        const queryKey: QueryKeyTimeline = ['Timeline', { page }]
        return (
          <Timeline
            queryKey={queryKey}
            lookback={page}
            customProps={{
              renderItem: ({ item }: any) => <TimelineDefault item={item} queryKey={queryKey} />
            }}
          />
        )
      },
      []
    )
    const children = useCallback(
      () => (
        <TabView
          lazy
          swipeEnabled
          renderScene={renderScene}
          renderTabBar={() => null}
          onIndexChange={index => setSegment(index)}
          navigationState={{ index: segment, routes }}
          initialLayout={{ width: Dimensions.get('screen').width }}
        />
      ),
      [segment]
    )

    usePopToTop()

    return (
      <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
        <Stack.Screen name='Tab-Public-Root' options={screenOptionsRoot} children={children} />
        {TabShared({ Stack })}
      </Stack.Navigator>
    )
  },
  () => true
)

export default TabPublic
