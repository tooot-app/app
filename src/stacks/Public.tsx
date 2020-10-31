import React from 'react'

import TimelinesCombined from 'src/stacks/common/TimelinesCombined'

const Public: React.FC = () => {
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

export default Public
