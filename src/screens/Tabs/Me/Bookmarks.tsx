import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useCallback } from 'react'

const TabMeBookmarks = React.memo(
  () => {
    const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Bookmarks' }]
    const renderItem = useCallback(
      ({ item }) => <TimelineDefault item={item} queryKey={queryKey} />,
      []
    )
    return <Timeline queryKey={queryKey} customProps={{ renderItem }} />
  },
  () => true
)

export default TabMeBookmarks
