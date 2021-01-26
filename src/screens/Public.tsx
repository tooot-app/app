import Timelines from '@components/Timelines'
import React from 'react'

const ScreenPublic = React.memo(
  () => {
    return <Timelines />
  },
  () => true
)

export default ScreenPublic
