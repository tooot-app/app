import { HeaderRight } from '@components/Header'
import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import SegmentedControl from '@react-native-community/segmented-control'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { TabPublicStackParamList } from '@utils/navigation/navigators'
import usePopToTop from '@utils/navigation/usePopToTop'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { getGlobalStorage, setGlobalStorage } from '@utils/storage/actions'
import { StorageGlobal } from '@utils/storage/versions/global'
import { useTheme } from '@utils/styles/ThemeManager'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions } from 'react-native'
import { SceneMap, TabView } from 'react-native-tab-view'

const Route = ({ route: { key: page } }: { route: any }) => {
  const queryKey: QueryKeyTimeline = ['Timeline', { page }]
  return (
    <Timeline
      queryKey={queryKey}
      disableRefresh={page === 'Trending'}
      customProps={{
        renderItem: ({ item }: any) => <TimelineDefault item={item} queryKey={queryKey} />
      }}
    />
  )
}

const renderScene = SceneMap({
  Local: Route,
  LocalPublic: Route,
  Trending: Route
})

const Root: React.FC<NativeStackScreenProps<TabPublicStackParamList, 'Tab-Public-Root'>> = ({
  navigation
}) => {
  const { mode } = useTheme()
  const { t } = useTranslation('screenTabs')

  const previousSegment = getGlobalStorage.string('app.prev_public_segment')
  const segments: StorageGlobal['app.prev_public_segment'][] = ['Local', 'LocalPublic', 'Trending']
  const [segment, setSegment] = useState<number>(
    segments.findIndex(segment => segment === previousSegment)
  )
  const [routes] = useState([
    { key: 'Local', title: t('tabs.public.segments.local') },
    { key: 'LocalPublic', title: t('tabs.public.segments.federated') },
    { key: 'Trending', title: t('tabs.public.segments.trending') }
  ])

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <SegmentedControl
          appearance={mode}
          values={routes.map(({ title }) => title)}
          selectedIndex={segment}
          onChange={({ nativeEvent }) => {
            setSegment(nativeEvent.selectedSegmentIndex)
            setGlobalStorage('app.prev_public_segment', segments[nativeEvent.selectedSegmentIndex])
          }}
          style={{ flexBasis: '65%' }}
        />
      ),
      headerRight: () => (
        <HeaderRight
          accessibilityLabel={t('common.search.accessibilityLabel')}
          accessibilityHint={t('common.search.accessibilityHint')}
          content='Search'
          onPress={() => navigation.navigate('Tab-Shared-Search')}
        />
      )
    })
  }, [mode, segment])

  usePopToTop()

  return (
    <TabView
      lazy
      swipeEnabled
      renderScene={renderScene}
      renderTabBar={() => null}
      onIndexChange={index => setSegment(index)}
      navigationState={{ index: segment, routes }}
      initialLayout={{ width: Dimensions.get('window').width }}
    />
  )
}

export default Root
