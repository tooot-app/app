import React from 'react'

import TimelinesCombined from 'src/stacks/common/TimelinesCombined'

export default function Local () {
  return (
    <TimelinesCombined
      name='Local'
      content={[
        { title: '关注', page: 'Following' },
        { title: '本站', page: 'Local' }
      ]}
    />
  )
}
