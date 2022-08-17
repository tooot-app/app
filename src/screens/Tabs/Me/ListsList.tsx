import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React from 'react'

const TabMeListsList: React.FC<TabMeStackScreenProps<'Tab-Me-Lists-List'>> = ({
  route: {
    params: { list }
  }
}) => {
  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'List', list }]

  return (
    <Timeline
      queryKey={queryKey}
      customProps={{
        renderItem: ({ item }) => (
          <TimelineDefault item={item} queryKey={queryKey} />
        )
      }}
    />
  )
}

export default TabMeListsList
