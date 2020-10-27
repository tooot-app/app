import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Animated, Dimensions, Text, View } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import SegmentedControl from '@react-native-community/segmented-control'
import { Feather } from '@expo/vector-icons'

import Timeline from './Timeline'
import Account from 'src/stacks/Shared/Account'
import Hashtag from 'src/stacks/Shared/Hashtag'
import Webview from 'src/stacks/Shared/Webview'

const Stack = createNativeStackNavigator()

export default function TimelinesCombined ({ name, content }) {
  const [segment, setSegment] = useState(0)
  const [renderHeader, setRenderHeader] = useState(false)

  useEffect(() => {
    const nbr = setTimeout(() => setRenderHeader(true), 50)
    return
  }, [])

  const moveAnimation = useRef(new Animated.Value(0)).current

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
              <Timeline page={content[0].page} />
            </View>
            <View style={{ width: Dimensions.get('window').width }}>
              <Timeline page={content[1].page} />
            </View>
          </Animated.View>
        )}
      </Stack.Screen>
      <Stack.Screen
        name='Account'
        component={Account}
        options={{
          headerTranslucent: true,
          headerStyle: { backgroundColor: 'rgba(255, 255, 255, 0)' },
          headerCenter: () => {}
        }}
      />
      <Stack.Screen
        name='Hashtag'
        component={Hashtag}
        options={({ route }) => ({
          title: `#${decodeURIComponent(route.params.hashtag)}`
        })}
      />
      <Stack.Screen
        name='Webview'
        component={Webview}
        options={({ route }) => ({
          title: `${route.params.domain}`
        })}
      />
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
