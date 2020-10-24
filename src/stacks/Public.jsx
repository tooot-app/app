import React from 'react'

import TimelinesCombined from 'src/stacks/common/TimelinesCombined'

export default function Public () {
  return (
    <TimelinesCombined
      page='Public'
      route={[
        { title: '跨站', timeline: { endpoint: 'public' } },
        { title: '他站', timeline: { remote: true } }
      ]}
    />
  )
}
