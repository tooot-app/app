import Timeline from '@components/Timelines/Timeline'
import React from 'react'
import { SharedHashtagProp } from './sharedScreens'

// Show remote hashtag? Only when private, show local version?

const TabSharedHashtag: React.FC<SharedHashtagProp> = ({
  route: {
    params: { hashtag }
  }
}) => {
  return <Timeline page='Hashtag' hashtag={hashtag} />
}

export default TabSharedHashtag
