import React from 'react'

import Timelines from 'src/components/Timelines'

const ScreenLocal: React.FC = () => {
  return (
    <Timelines
      name='Local'
      content={[
        { title: '关注', page: 'Following' },
        { title: '本站', page: 'Local' }
      ]}
    />
  )
}

export default ScreenLocal
