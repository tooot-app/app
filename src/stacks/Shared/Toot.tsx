import React from 'react'

import Timeline from 'src/stacks/common/Timeline'

// Show remote hashtag? Only when private, show local version?

export interface Props {
  route: {
    params: {
      toot: string
    }
  }
}

const Toot: React.FC<Props> = ({
  route: {
    params: { toot }
  }
}) => {
  return <Timeline page='Toot' toot={toot} disableRefresh />
}

export default Toot
