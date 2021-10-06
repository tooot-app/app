import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useCallback } from 'react'

const TabMeListsList: React.FC<TabMeStackScreenProps<'Tab-Me-Lists-List'>> = ({
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
