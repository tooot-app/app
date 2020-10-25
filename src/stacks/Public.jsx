import React from 'react'

import TimelinesCombined from 'src/stacks/common/TimelinesCombined'

export default function Public () {
  return (
    <TimelinesCombined
      name='Public'
      content={[
        { title: '跨站', page: 'LocalPublic' },
        { title: '他站', page: 'RemotePublic' }
      ]}
    />
  )
}
