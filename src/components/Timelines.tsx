import React, { useCallback, useState } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import SegmentedControl from '@react-native-community/segmented-control'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { useSelector } from 'react-redux'

import Timeline from '@components/Timelines/Timeline'
import sharedScreens from '@screens/Shared/sharedScreens'
import { getLocalUrl, getRemoteUrl } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import { useNavigation } from '@react-navigation/native'
import getCurrentTab from '@utils/getCurrentTab'
import { HeaderRight } from './Header'
import { TabView } from 'react-native-tab-view'

const Stack = createNativeStackNavigator()

export interface Props {
  name: 'Screen-Local-Root' | 'Screen-Public-Root'
  content: { title: string; page: App.Pages }[]
}

const Timelines: React.FC<Props> = ({ name, content }) => {
  const navigation = useNavigation()
  const { mode } = useTheme()
  const localRegistered = useSelector(getLocalUrl)
  const publicDomain = useSelector(getRemoteUrl)
  const [segment, setSegment] = useState(0)

  const onPressSearch = useCallback(() => {
    navigation.navigate(getCurrentTab(navigation), {
      screen: 'Screen-Shared-Search'
    })
  }, [])

  const routes = content
    .filter(p => (localRegistered ? true : p.page === 'RemotePublic'))
    .map(p => ({ key: p.page }))

  const renderScene = ({
    route
  }: {
    route: {
      key: App.Pages
    }
  }) => {
    return (
      (localRegistered || route.key === 'RemotePublic') && (
        <Timeline page={route.key} />
      )
    )
  }

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
    [segment, localRegistered]
  )

  return (
    <Stack.Navigator screenOptions={{ headerHideShadow: true }}>
      <Stack.Screen
        name={name}
        options={{
          headerTitle: name === 'Screen-Public-Root' ? publicDomain : '',
          ...(localRegistered && {
            headerCenter: () => (
              <View style={styles.segmentsContainer}>
                <SegmentedControl
                  appearance={mode}
                  values={[content[0].title, content[1].title]}
                  selectedIndex={segment}
                  onChange={({ nativeEvent }) =>
                    setSegment(nativeEvent.selectedSegmentIndex)
                  }
                />
              </View>
            ),
            headerRight: () => (
              <HeaderRight icon='search' onPress={onPressSearch} />
            )
          })
        }}
      >
        {screenComponent}
      </Stack.Screen>

      {sharedScreens(Stack)}
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  segmentsContainer: {
    flexBasis: '60%'
  }
})

export default React.memo(Timelines, () => true)
