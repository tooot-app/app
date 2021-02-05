import Timeline from '@components/Timelines/Timeline'
import React from 'react'
import { SharedTootProp } from './sharedScreens'

const TabSharedToot: React.FC<SharedTootProp> = ({
  route: {
    params: { toot }
  }
}) => {
  return <Timeline page='Toot' toot={toot.id} disableRefresh disableInfinity />
}

export default TabSharedToot
