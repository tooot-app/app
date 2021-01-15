import Timeline from '@components/Timelines/Timeline'
import React from 'react'
import { SharedAttachmentsProp } from './sharedScreens'

const ScreenSharedAttachments: React.FC<SharedAttachmentsProp> = ({
  route: {
    params: { account }
  }
}) => {
  return <Timeline page='Account_Attachments' account={account.id} />
}

export default ScreenSharedAttachments
