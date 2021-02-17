import Timeline from '@components/Timeline'
import React from 'react'
import { SharedTootProp } from './sharedScreens'

const TabSharedToot: React.FC<SharedTootProp> = ({
  route: {
    params: { toot, rootQueryKey }
  }
}) => {
  return (
    <Timeline
      page='Toot'
      toot={toot.id}
      rootQueryKey={rootQueryKey}
      disableRefresh
      disableInfinity
    />
  )
}

export default TabSharedToot
