import React from 'react'

import Timeline from 'src/stacks/common/Timeline'

// Show remote hashtag? Only when private, show local version?

export interface Props {
  route: {
    params: {
      hashtag: string
    }
  }
}

const Hashtag: React.FC<Props> = ({
  route: {
    params: { hashtag }
  }
}) => {
  return <Timeline page='Hashtag' hashtag={hashtag} />
}

export default Hashtag
