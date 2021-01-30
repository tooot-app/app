import Timelines from '@components/Timelines'
import React from 'react'

const TabPublic = React.memo(
  () => {
    return <Timelines />
  },
  () => true
)

export default TabPublic
