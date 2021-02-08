import Timeline from '@components/Timeline'
import React from 'react'

const ScreenMeConversations = React.memo(
  () => {
    return <Timeline page='Conversations' />
  },
  () => true
)

export default ScreenMeConversations
