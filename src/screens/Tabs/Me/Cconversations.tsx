import Timeline from '@components/Timeline'
import TimelineConversation from '@components/Timeline/Conversation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { TabMeStackParamList } from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useEffect } from 'react'

const TabMeConversations: React.FC<
  NativeStackScreenProps<TabMeStackParamList, 'Tab-Me-Conversations'>
> = ({ navigation }) => {
  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Conversations' }]
  useEffect(() => {
    navigation.setParams({ queryKey: queryKey })
  }, [])

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
