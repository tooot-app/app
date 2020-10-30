import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Dimensions, FlatList, View } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import SegmentedControl from '@react-native-community/segmented-control'
import { Feather } from '@expo/vector-icons'

import Timeline from './Timeline'
import sharedScreens from 'src/stacks/Shared/sharedScreens'

const Stack = createNativeStackNavigator()

function Page ({ item: { page } }) {
  return (
    <View style={{ width: Dimensions.get('window').width }}>
      <Timeline page={page} />
    </View>
  )
}

export default function TimelinesCombined ({ name, content }) {
  const [segment, setSegment] = useState(0)
  const [renderHeader, setRenderHeader] = useState(false)
  const [segmentManuallyTriggered, setSegmentManuallyTriggered] = useState(
    false
  )

  useEffect(() => {
    const nbr = setTimeout(() => setRenderHeader(true), 50)
    return
  }, [])

  const horizontalPaging = useRef()

  return (
    <Stack.Navigator>
      <Stack.Screen
        name={name}
        options={{
          statusBarAnimation: 'none',
          headerRight: () =>
            renderHeader ? (
              <Feather name='search' size={24} color='black' />
            ) : null,
          headerCenter: () =>
            renderHeader ? (
              <SegmentedControl
                values={[content[0].title, content[1].title]}
                selectedIndex={segment}
                onChange={({ nativeEvent }) => {
                  setSegmentManuallyTriggered(true)
                  setSegment(nativeEvent.selectedSegmentIndex)
                  horizontalPaging.current.scrollToIndex({
                    index: nativeEvent.selectedSegmentIndex
                  })
                }}
                style={{ width: 150, height: 30 }}
              />
            ) : null
        }}
      >
        {() => (
          <FlatList
            style={{ width: Dimensions.get('window').width, height: '100%' }}
            data={content}
            keyExtractor={({ page }) => page}
            renderItem={({ item, index }) => {
              return <Page key={index} item={item} />
            }}
            ref={horizontalPaging}
            bounces={false}
            getItemLayout={(data, index) => ({
              length: Dimensions.get('window').width,
              offset: Dimensions.get('window').width * index,
              index
            })}
            horizontal
            onMomentumScrollEnd={() => setSegmentManuallyTriggered(false)}
            onScroll={({ nativeEvent }) =>
              !segmentManuallyTriggered &&
              setSegment(
                nativeEvent.contentOffset.x <=
                  Dimensions.get('window').width / 2
                  ? 0
                  : 1
              )
            }
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          />
        )}
      </Stack.Screen>

      {sharedScreens(Stack)}
    </Stack.Navigator>
  )
}

TimelinesCombined.propTypes = {
  name: PropTypes.string.isRequired,
  content: PropTypes.arrayOf(
    PropTypes.exact({
      title: PropTypes.string.isRequired,
      page: Timeline.propTypes.page
    })
  ).isRequired
}
