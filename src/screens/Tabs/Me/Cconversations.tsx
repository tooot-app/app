import Timeline from '@components/Timeline'
import TimelineConversation from '@components/Timeline/Conversation'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useCallback } from 'react'

const ScreenMeConversations = React.memo(
  () => {
    const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Conversations' }]
    const renderItem = useCallback(
      ({ item }) => (
        <TimelineConversation conversation={item} queryKey={queryKey} />
      ),
      []
    )

    return <Timeline queryKey={queryKey} customProps={{ renderItem }} />
  },
  () => true
)

export default ScreenMeConversations
