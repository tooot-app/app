import { HeaderRight } from '@components/Header'
import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import SegmentedControl from '@react-native-community/segmented-control'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useAppDispatch } from '@root/store'
import { ContextsLatest } from '@utils/migrations/contexts/migration'
import { TabPublicStackParamList } from '@utils/navigation/navigators'
import usePopToTop from '@utils/navigation/usePopToTop'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { getPreviousSegment, updatePreviousSegment } from '@utils/slices/contextsSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions } from 'react-native'
import { SceneMap, TabView } from 'react-native-tab-view'
import { useSelector } from 'react-redux'

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

  const dispatch = useAppDispatch()
  const previousSegment = useSelector(getPreviousSegment, () => true)
  const segments: ContextsLatest['previousSegment'][] = ['Local', 'LocalPublic', 'Trending']
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
            dispatch(updatePreviousSegment(segments[nativeEvent.selectedSegmentIndex]))
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
      initialLayout={{ width: Dimensions.get('screen').width }}
    />
  )
}

export default Root
