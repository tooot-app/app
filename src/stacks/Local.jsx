import React from 'react'

import TimelinesCombined from 'src/stacks/common/TimelinesCombined'

export default function Local () {
  return (
    <TimelinesCombined
      name='Local'
      content={[
        { title: '关注', timeline: { endpoint: 'home' } },
        { title: '本站', timeline: { endpoint: 'public', local: true } }
      ]}
    />
  )
}
