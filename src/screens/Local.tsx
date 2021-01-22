import Timelines from '@components/Timelines'
import React from 'react'

const ScreenLocal = React.memo(
  () => {
    return <Timelines name='Local' />
  },
  () => true
)

export default ScreenLocal
