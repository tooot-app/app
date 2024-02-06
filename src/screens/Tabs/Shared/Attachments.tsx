import Timeline from '@components/Timeline'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useEffect } from 'react'

const TabSharedAttachments: React.FC<TabSharedStackScreenProps<'Tab-Shared-Attachments'>> = ({
  navigation,
  route: {
    params: { account }
  }
}) => {
  useEffect(() => {
    navigation.setParams({ queryKey })
  }, [])

  const queryKey: QueryKeyTimeline = [
    'Timeline',
    {
      page: 'Account',
      type: 'attachments',
      id: account.id,
      ...(account._remote && { remote_id: account.id, remote_domain: account._remote })
    }
  ]

  return <Timeline queryKey={queryKey} />
}

export default TabSharedAttachments
