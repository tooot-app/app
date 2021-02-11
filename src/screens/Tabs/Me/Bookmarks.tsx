import Timeline from '@components/Timeline'
import React from 'react'

const ScreenMeBookmarks = React.memo(
  () => {
    return <Timeline page='Bookmarks' />
  },
  () => true
)

export default ScreenMeBookmarks
