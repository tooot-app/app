import Timelines from '@components/Timelines'
import React from 'react'

const ScreenPublic = React.memo(
  () => {
    return <Timelines name='Public' />
  },
  () => true
)

export default ScreenPublic
