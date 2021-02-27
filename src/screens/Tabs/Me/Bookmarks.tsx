import Timeline from '@components/Timeline'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React from 'react'

const ScreenMeBookmarks = React.memo(
  () => {
    const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Bookmarks' }]

    return <Timeline queryKey={queryKey} />
  },
  () => true
)

export default ScreenMeBookmarks
