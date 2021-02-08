import Timeline from '@components/Timeline'
import React from 'react'

const ScreenMeFavourites = React.memo(
  () => {
    return <Timeline page='Favourites' />
  },
  () => true
)

export default ScreenMeFavourites
