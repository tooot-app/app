import Timeline from '@components/Timeline'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React from 'react'

const ScreenMeFavourites = React.memo(
  () => {
    const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Favourites' }]

    return <Timeline queryKey={queryKey} />
  },
  () => true
)

export default ScreenMeFavourites
