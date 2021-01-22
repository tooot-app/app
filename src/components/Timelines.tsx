import { HeaderCenter, HeaderRight } from '@components/Header'
import Timeline from '@components/Timelines/Timeline'
import SegmentedControl from '@react-native-community/segmented-control'
import { useNavigation } from '@react-navigation/native'
import sharedScreens from '@screens/Shared/sharedScreens'
import { getLocalActiveIndex, getRemoteUrl } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Platform, StyleSheet } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { TabView } from 'react-native-tab-view'
import ViewPagerAdapter from 'react-native-tab-view-viewpager-adapter'
import { useSelector } from 'react-redux'

const Stack = createNativeStackNavigator<
  Nav.LocalStackParamList | Nav.RemoteStackParamList
>()

export interface Props {
  name: 'Local' | 'Public'
}

const Timelines: React.FC<Props> = ({ name }) => {
  const { t, i18n } = useTranslation()
  const remoteUrl = useSelector(getRemoteUrl)
  const mapNameToContent: {
    [key: string]: { title: string; page: App.Pages }[]
  } = {
    Local: [
      { title: t('local:heading.segments.left'), page: 'Following' },
      { title: t('local:heading.segments.right'), page: 'Local' }
    ],
    Public: [
      { title: t('public:heading.segments.left'), page: 'LocalPublic' },
      { title: remoteUrl, page: 'RemotePublic' }
    ]
  }

  const navigation = useNavigation()
  const localActiveIndex = useSelector(getLocalActiveIndex)

  const onPressSearch = useCallback(() => {
    navigation.navigate(`Screen-${name}`, { screen: 'Screen-Shared-Search' })
  }, [])

  const routes = mapNameToContent[name]
    .filter(p => (localActiveIndex !== null ? true : p.page === 'RemotePublic'))
    .map(p => ({ key: p.page }))

  const renderScene = useCallback(
    ({
      route
    }: {
      route: {
        key: App.Pages
      }
    }) => {
      return (
        (localActiveIndex !== null || route.key === 'RemotePublic') && (
          <Timeline page={route.key} />
        )
      )
    },
    [localActiveIndex]
  )

  const { mode } = useTheme()
  const [segment, setSegment] = useState(0)
  const screenOptions = useMemo(() => {
    if (localActiveIndex === null) {
      if (name === 'Public') {
        return {
          headerTitle: remoteUrl,
          ...(Platform.OS === 'android' && {
            headerCenter: () => <HeaderCenter content={remoteUrl} />
          })
        }
      }
    } else {
      return {
        headerCenter: () => (
          <SegmentedControl
            appearance={mode}
            values={mapNameToContent[name].map(p => p.title)}
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
      <Stack.Screen
        // @ts-ignore
        name={`Screen-${name}-Root`}
        options={screenOptions}
      >
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

      {sharedScreens(Stack)}
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  segmentsContainer: {
    flexBasis: '65%'
  }
})

export default React.memo(Timelines, () => true)
