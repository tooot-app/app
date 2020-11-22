import React from 'react'

import Timeline from 'src/components/Timelines/Timeline'

// Show remote hashtag? Only when private, show local version?

export interface Props {
  route: {
    params: {
      toot: string
    }
  }
}

const ScreenSharedToot: React.FC<Props> = ({
  route: {
    params: { toot }
  }
}) => {
  return <Timeline page='Toot' toot={toot} disableRefresh />
}

export default ScreenSharedToot
