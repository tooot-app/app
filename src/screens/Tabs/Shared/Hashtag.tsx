import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useCallback } from 'react'
import { SharedHashtagProp } from './sharedScreens'

const TabSharedHashtag: React.FC<SharedHashtagProp> = ({
  route: {
    params: { hashtag }
  }
}) => {
  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Hashtag', hashtag }]
  const renderItem = useCallback(
    ({ item }) => <TimelineDefault item={item} queryKey={queryKey} />,
    []
  )
  return <Timeline queryKey={queryKey} customProps={{ renderItem }} />
}

export default TabSharedHashtag
