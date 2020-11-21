import React, { useRef, useState } from 'react'
import { Dimensions, FlatList, View } from 'react-native'
import SegmentedControl from '@react-native-community/segmented-control'

import Timeline from 'src/screens/Timelines/Timeline'

export interface Props {
  id: Mastodon.Account['id']
}

const AccountToots: React.FC<Props> = ({ id }) => {
  const [segment, setSegment] = useState(0)
  const [segmentManuallyTriggered, setSegmentManuallyTriggered] = useState(
    false
  )
  const horizontalPaging = useRef<any>()

  const pages: ['Account_Default', 'Account_All', 'Account_Media'] = [
    'Account_Default',
    'Account_All',
    'Account_Media'
  ]

  return (
    <>
      <SegmentedControl
        values={['嘟嘟', '嘟嘟和回复', '媒体']}
        selectedIndex={segment}
        onChange={({ nativeEvent }) => {
          setSegmentManuallyTriggered(true)
          setSegment(nativeEvent.selectedSegmentIndex)
          horizontalPaging.current.scrollToIndex({
            index: nativeEvent.selectedSegmentIndex
          })
        }}
        style={{ width: '100%', height: 30 }}
      />
      <FlatList
        style={{ width: Dimensions.get('window').width, height: '100%' }}
        data={pages}
        keyExtractor={page => page}
        renderItem={({ item, index }) => {
          return (
            <View style={{ width: Dimensions.get('window').width }}>
              <Timeline
                key={index}
                page={item}
                account={id}
                disableRefresh
                scrollEnabled={false}
              />
            </View>
          )
        }}
        ref={horizontalPaging}
        bounces={false}
        getItemLayout={(data, index) => ({
          length: Dimensions.get('window').width,
          offset: Dimensions.get('window').width * index,
          index
        })}
        horizontal
        onMomentumScrollEnd={() => {
          setSegmentManuallyTriggered(false)
        }}
        onScroll={({ nativeEvent }) =>
          !segmentManuallyTriggered &&
          setSegment(
            nativeEvent.contentOffset.x <= Dimensions.get('window').width / 3
              ? 0
              : 1
          )
        }
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />
    </>
  )
}

export default AccountToots
