import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Animated, Dimensions, View } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import SegmentedControl from '@react-native-community/segmented-control'
import { Feather } from '@expo/vector-icons'

import Timeline from './Timeline'

const Stack = createNativeStackNavigator()

export default function TimelinesCombined ({ route }) {
  const [segment, setSegment] = useState(0)
  const [renderHeader, setRenderHeader] = useState(false)

  useEffect(() => {
    const nbr = setTimeout(() => setRenderHeader(true), 50)
    return
  }, [])

  const moveAnimation = useRef(new Animated.Value(0)).current

  return (
    <Stack.Navigator
      screenOptions={{
        statusBarAnimation: 'none',
        headerRight: () =>
          renderHeader ? (
            <Feather name='search' size={24} color='black' />
          ) : null,
        headerCenter: () =>
          renderHeader ? (
            <SegmentedControl
              values={[route[0].title, route[1].title]}
              selectedIndex={segment}
              onChange={e => {
                setSegment(e.nativeEvent.selectedSegmentIndex)
                Animated.timing(moveAnimation, {
                  toValue:
                    -e.nativeEvent.selectedSegmentIndex *
                    Dimensions.get('window').width,
                  duration: 250,
                  useNativeDriver: false
                }).start()
              }}
              style={{ width: 150, height: 30 }}
            />
          ) : null
      }}
    >
      <Stack.Screen name='LocalView'>
        {props => (
          <Animated.View
            style={{
              flexDirection: 'row',
              width: Dimensions.get('window').width * 2,
              left: moveAnimation
            }}
            {...props}
          >
            <View style={{ width: Dimensions.get('window').width }}>
              <Timeline {...route[0].timeline} />
            </View>
            <View style={{ width: Dimensions.get('window').width }}>
              <Timeline {...route[1].timeline} />
            </View>
          </Animated.View>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

TimelinesCombined.propTypes = {
  route: PropTypes.arrayOf(
    PropTypes.exact({
      title: PropTypes.string.isRequired,
      timeline: PropTypes.exact(Timeline.propTypes).isRequired
    })
  ).isRequired
}
