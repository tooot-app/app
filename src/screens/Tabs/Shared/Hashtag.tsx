import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React from 'react'

const TabSharedHashtag: React.FC<
  TabSharedStackScreenProps<'Tab-Shared-Hashtag'>
> = ({
  route: {
    params: { hashtag }
  }
}) => {
  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Hashtag', hashtag }]
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

export default TabSharedHashtag
