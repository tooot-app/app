import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, FlatList, StyleSheet, View } from 'react-native'
import SegmentedControl from '@react-native-community/segmented-control'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { useSelector } from 'react-redux'
import { Feather } from '@expo/vector-icons'

import Timeline from './Timelines/Timeline'
import sharedScreens from 'src/screens/Shared/sharedScreens'
import {
  getLocalUrl,
  getRemoteUrl,
  InstancesState
} from 'src/utils/slices/instancesSlice'
import { useTheme } from 'src/utils/styles/ThemeManager'
import { useNavigation } from '@react-navigation/native'
import getCurrentTab from 'src/utils/getCurrentTab'
import PleaseLogin from './PleaseLogin'

const Stack = createNativeStackNavigator()

const Page = ({
  item: { page },
  localRegistered
}: {
  item: { page: App.Pages }
  localRegistered: InstancesState['local']['url'] | undefined
}) => {
  return (
    <View style={{ width: Dimensions.get('window').width }}>
      {localRegistered || page === 'RemotePublic' ? (
        <Timeline page={page} />
      ) : (
        <PleaseLogin />
      )}
    </View>
  )
}

export interface Props {
  name: 'Screen-Local-Root' | 'Screen-Public-Root'
  content: { title: string; page: App.Pages }[]
}

const Timelines: React.FC<Props> = ({ name, content }) => {
  const navigation = useNavigation()
  const { mode, theme } = useTheme()
  const localRegistered = useSelector(getLocalUrl)
  const publicDomain = useSelector(getRemoteUrl)
  const [segment, setSegment] = useState(0)
  const [renderHeader, setRenderHeader] = useState(false)

  useEffect(() => {
    const nbr = setTimeout(() => setRenderHeader(true), 50)
    return
  }, [])

  const horizontalPaging = useRef<FlatList>(null!)

  const onChangeSegment = useCallback(({ nativeEvent }) => {
    horizontalPaging.current.scrollToIndex({
      index: nativeEvent.selectedSegmentIndex
    })
  }, [])
  const onPressSearch = useCallback(() => {
    navigation.navigate(getCurrentTab(navigation), {
      screen: 'Screen-Shared-Search'
    })
  }, [])

  const flGetItemLayout = useCallback(
    (data, index) => ({
      length: Dimensions.get('window').width,
      offset: Dimensions.get('window').width * index,
      index
    }),
    []
  )
  const flKeyExtrator = useCallback(({ page }) => page, [])
  const flRenderItem = useCallback(
    ({ item, index }) => {
      if (!localRegistered && index === 0) {
        return null
      }
      return <Page item={item} localRegistered={localRegistered} />
    },
    [localRegistered]
  )
  const flOnScroll = useCallback(
    ({ nativeEvent }) =>
      setSegment(
        nativeEvent.contentOffset.x <= Dimensions.get('window').width / 2
          ? 0
          : 1
      ),
    []
  )

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
                    onChange={onChangeSegment}
                  />
                </View>
              ),
              headerRight: () => (
                <Feather
                  name='search'
                  size={24}
                  color={theme.secondary}
                  onPress={onPressSearch}
                />
              )
            })
        }}
      >
        {() => {
          return (
            <FlatList
              horizontal
              pagingEnabled
              data={content}
              bounces={false}
              onScroll={flOnScroll}
              ref={horizontalPaging}
              style={styles.flatList}
              renderItem={flRenderItem}
              extraData={localRegistered}
              keyExtractor={flKeyExtrator}
              getItemLayout={flGetItemLayout}
              showsHorizontalScrollIndicator={false}
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
  flatList: {
    width: Dimensions.get('window').width,
    height: '100%'
  }
})

export default React.memo(Timelines, () => true)
