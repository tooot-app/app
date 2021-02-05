import { HeaderRight } from '@components/Header'
import Timeline from '@components/Timelines/Timeline'
import SegmentedControl from '@react-native-community/segmented-control'
import { useNavigation } from '@react-navigation/native'
import sharedScreens from '@screens/Tabs/Shared/sharedScreens'
import { getLocalActiveIndex } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, StyleSheet } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { TabView } from 'react-native-tab-view'
import ViewPagerAdapter from 'react-native-tab-view-viewpager-adapter'
import { useSelector } from 'react-redux'
import analytics from './analytics'

const Stack = createNativeStackNavigator<Nav.TabPublicStackParamList>()

const Timelines: React.FC = () => {
  const { t, i18n } = useTranslation()
  const pages: { title: string; page: App.Pages }[] = [
    { title: t('public:heading.segments.left'), page: 'LocalPublic' },
    { title: t('public:heading.segments.right'), page: 'Local' }
  ]

  const navigation = useNavigation()
  const localActiveIndex = useSelector(getLocalActiveIndex)

  const onPressSearch = useCallback(() => {
    analytics('search_tap', { page: pages[segment].page })
    navigation.navigate('Tab-Public', { screen: 'Tab-Shared-Search' })
  }, [])

  const routes = pages.map(p => ({ key: p.page }))

  const renderScene = useCallback(
    ({
      route
    }: {
      route: {
        key: App.Pages
      }
    }) => {
      return localActiveIndex !== null && <Timeline page={route.key} />
    },
    [localActiveIndex]
  )

  const { mode } = useTheme()
  const [segment, setSegment] = useState(0)
  const screenOptions = useMemo(() => {
    if (localActiveIndex !== null) {
      return {
        headerCenter: () => (
          <SegmentedControl
            appearance={mode}
            values={pages.map(p => p.title)}
            selectedIndex={segment}
            onChange={({ nativeEvent }) =>
              setSegment(nativeEvent.selectedSegmentIndex)
            }
            style={styles.segmentsContainer}
          />
        ),
        headerRight: () => (
          <HeaderRight content='Search' onPress={onPressSearch} />
        )
      }
    }
  }, [localActiveIndex, mode, segment, i18n.language])

  const renderPager = useCallback(props => <ViewPagerAdapter {...props} />, [])

  return (
    <Stack.Navigator
      screenOptions={{ headerHideShadow: true, headerTopInsetEnabled: false }}
    >
      <Stack.Screen name='Screen-Remote-Root' options={screenOptions}>
        {() => (
          <TabView
            lazy
            swipeEnabled
            renderPager={renderPager}
            renderScene={renderScene}
            renderTabBar={() => null}
            onIndexChange={index => setSegment(index)}
            navigationState={{ index: segment, routes }}
            initialLayout={{ width: Dimensions.get('screen').width }}
          />
        )}
      </Stack.Screen>

      {sharedScreens(Stack as any)}
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  segmentsContainer: {
    flexBasis: '65%'
  }
})

export default React.memo(Timelines, () => true)
