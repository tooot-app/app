import React from 'react'

import Timeline from 'src/components/Timelines/Timeline'

// Show remote hashtag? Only when private, show local version?

export interface Props {
  route: {
    params: {
      hashtag: string
    }
  }
}

const ScreenSharedHashtag: React.FC<Props> = ({
  route: {
    params: { hashtag }
  }
}) => {
  return <Timeline page='Hashtag' hashtag={hashtag} />
}

export default ScreenSharedHashtag
