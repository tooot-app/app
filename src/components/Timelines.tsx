import { HeaderRight } from '@components/Header'
import Timeline from '@components/Timelines/Timeline'
import SegmentedControl from '@react-native-community/segmented-control'
import { useNavigation } from '@react-navigation/native'
import sharedScreens from '@screens/Shared/sharedScreens'
import { getLocalActiveIndex, getRemoteUrl } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useState } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { TabView } from 'react-native-tab-view'
import { useSelector } from 'react-redux'

const Stack = createNativeStackNavigator<
  Nav.LocalStackParamList | Nav.RemoteStackParamList
>()

export interface Props {
  name: 'Local' | 'Public'
  content: { title: string; page: App.Pages; remote?: boolean }[]
}

const Timelines: React.FC<Props> = ({ name, content }) => {
  const remoteUrl = useSelector(getRemoteUrl)
  const navigation = useNavigation()
  const { mode } = useTheme()
  const localActiveIndex = useSelector(getLocalActiveIndex)
  const publicDomain = useSelector(getRemoteUrl)
  const [segment, setSegment] = useState(0)

  const onPressSearch = useCallback(() => {
    navigation.navigate(`Screen-${name}`, { screen: 'Screen-Shared-Search' })
  }, [])

  const routes = content
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

  const screenComponent = useCallback(
    () => (
      <TabView
        lazy
        swipeEnabled
        renderScene={renderScene}
        renderTabBar={() => null}
        onIndexChange={index => setSegment(index)}
        navigationState={{ index: segment, routes }}
        initialLayout={{ width: Dimensions.get('window').width }}
      />
    ),
    [segment, localActiveIndex]
  )

  return (
    <Stack.Navigator screenOptions={{ headerHideShadow: true }}>
      <Stack.Screen
        // @ts-ignore
        name={`Screen-${name}-Root`}
        component={screenComponent}
        options={{
          headerTitle: name === 'Public' ? publicDomain : '',
          ...(localActiveIndex !== null && {
            headerCenter: () => (
              <View style={styles.segmentsContainer}>
                <SegmentedControl
                  appearance={mode}
                  values={[
                    content[0].title,
                    content[1].remote ? remoteUrl : content[1].title
                  ]}
                  selectedIndex={segment}
                  onChange={({ nativeEvent }) =>
                    setSegment(nativeEvent.selectedSegmentIndex)
                  }
                />
              </View>
            ),
            headerRight: () => (
              <HeaderRight content='Search' onPress={onPressSearch} />
            )
          })
        }}
      />

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
