import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useCallback } from 'react'
import { SharedAttachmentsProp } from './sharedScreens'

const TabSharedAttachments: React.FC<SharedAttachmentsProp> = ({
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
