import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { StackScreenProps } from '@react-navigation/stack'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useCallback } from 'react'

const TabMeListsList: React.FC<StackScreenProps<
  Nav.TabMeStackParamList,
  'Tab-Me-Lists-List'
>> = ({
  route: {
    params: { list }
  }
}) => {
  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'List', list }]
  const renderItem = useCallback(
    ({ item }) => <TimelineDefault item={item} queryKey={queryKey} />,
    []
  )

  return <Timeline queryKey={queryKey} customProps={{ renderItem }} />
}

export default TabMeListsList
