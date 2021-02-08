import Timeline from '@components/Timeline'
import React from 'react'
import { SharedAttachmentsProp } from './sharedScreens'

const TabSharedAttachments: React.FC<SharedAttachmentsProp> = ({
  route: {
    params: { account }
  }
}) => {
  return <Timeline page='Account_Attachments' account={account.id} />
}

export default TabSharedAttachments
