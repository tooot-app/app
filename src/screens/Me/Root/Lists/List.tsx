import React from 'react'

import Timeline from 'src/components/Timelines/Timeline'

// Show remote hashtag? Only when private, show local version?

export interface Props {
  route: {
    params: {
      list: string
    }
  }
}

const ScreenMeListsList: React.FC<Props> = ({
  route: {
    params: { list }
  }
}) => {
  return <Timeline page='List' list={list} />
}

export default ScreenMeListsList
