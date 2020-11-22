import React from 'react'

import Timelines from 'src/components/Timelines'

const ScreenPublic: React.FC = () => {
  return (
    <Timelines
      name='Public'
      content={[
        { title: '跨站', page: 'LocalPublic' },
        { title: '他站', page: 'RemotePublic' }
      ]}
    />
  )
}

export default ScreenPublic
