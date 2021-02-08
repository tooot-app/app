import analytics from '@components/analytics'
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

const Stack = createNativeStackNavigator<Nav.TabPublicStackParamList>()

const TabPublic = React.memo(
  () => {
    const { t, i18n } = useTranslation()
    const { mode } = useTheme()
    const navigation = useNavigation()
    const localActiveIndex = useSelector(getLocalActiveIndex)

    const [segment, setSegment] = useState(0)
    const pages: { title: string; page: App.Pages }[] = [
      { title: t('public:heading.segments.left'), page: 'LocalPublic' },
      { title: t('public:heading.segments.right'), page: 'Local' }
    ]
    const screenOptions = useMemo(
      () => ({
        headerHideShadow: true,
        headerTopInsetEnabled: false
      }),
      []
    )
    const screenOptionsRoot = useMemo(
      () => ({
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
          <HeaderRight
            content='Search'
            onPress={() => {
              analytics('search_tap', { page: pages[segment].page })
              navigation.navigate('Tab-Public', { screen: 'Tab-Shared-Search' })
            }}
          />
        )
      }),
      [mode, segment, i18n.language]
    )

    const routes = pages.map(p => ({ key: p.page }))
    const renderPager = useCallback(
      props => <ViewPagerAdapter {...props} />,
      []
    )
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
    const children = useCallback(
      () => (
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
      ),
      [segment]
    )

    return (
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name='Tab-Public-Root'
          options={screenOptionsRoot}
          children={children}
        />
        {sharedScreens(Stack as any)}
      </Stack.Navigator>
    )
  },
  () => true
)

const styles = StyleSheet.create({
  segmentsContainer: {
    flexBasis: '65%'
  }
})

export default TabPublic
