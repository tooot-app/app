import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useCallback } from 'react'

const TabSharedAttachments: React.FC<TabSharedStackScreenProps<
  'Tab-Shared-Attachments'
>> = ({
  route: {
    params: { account }
  }
}) => {
  const queryKey: QueryKeyTimeline = [
    'Timeline',
    { page: 'Account_Attachments', account: account.id }
  ]
  const renderItem = useCallback(
    ({ item }) => <TimelineDefault item={item} queryKey={queryKey} />,
    []
  )
  return <Timeline queryKey={queryKey} customProps={{ renderItem }} />
}

export default TabSharedAttachments
