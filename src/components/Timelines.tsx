import React, { useCallback, useEffect, useState } from 'react'
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
  const [renderHeader, setRenderHeader] = useState(false)

  useEffect(() => {
    const nbr = setTimeout(() => setRenderHeader(true), 50)
    return
  }, [])

  const onPressSearch = useCallback(() => {
    navigation.navigate(getCurrentTab(navigation), {
      screen: 'Screen-Shared-Search'
    })
  }, [])

  const [routes] = useState(content.map(p => ({ key: p.page })))
  const renderScene = ({
    route
  }: {
    route: {
      key: App.Pages
    }
  }) => {
    return <Timeline page={route.key} />
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name={name}
        options={{
          headerTitle: name === 'Screen-Public-Root' ? publicDomain : '',
          ...(renderHeader &&
            localRegistered && {
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
        {() => {
          return (
            <TabView
              style={styles.base}
              navigationState={{ index: segment, routes }}
              renderScene={renderScene}
              renderTabBar={() => null}
              onIndexChange={index => setSegment(index)}
              initialLayout={{ width: Dimensions.get('window').width }}
              lazy
              swipeEnabled
              swipeVelocityImpact={1}
            />
          )
        }}
      </Stack.Screen>

      {sharedScreens(Stack)}
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  segmentsContainer: {
    flexBasis: '60%'
  },
  base: {
    width: Dimensions.get('window').width
  }
})

export default React.memo(Timelines, () => true)
