import Timeline from '@components/Timeline'
import TimelineConversation from '@components/Timeline/Conversation'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React from 'react'

const TabMeConversations = () => {
  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Conversations' }]

  return (
    <Timeline
      queryKey={queryKey}
      customProps={{
        renderItem: ({ item }) => <TimelineConversation conversation={item} queryKey={queryKey} />
      }}
    />
  )
}

export default TabMeConversations
