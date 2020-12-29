import React, { useContext } from 'react'
import { ComposeContext } from '@screens/Shared/Compose'
import ComposeAttachments from '@screens/Shared/Compose/Attachments'
import ComposeEmojis from '@screens/Shared/Compose/Emojis'
import ComposePoll from '@screens/Shared/Compose/Poll'
import ComposeReply from '@screens/Shared/Compose/Reply'

const ComposeRootFooter: React.FC = () => {
  const { composeState } = useContext(ComposeContext)

  return (
    <>
      {composeState.emoji.active ? <ComposeEmojis /> : null}
      {composeState.attachments.uploads.length ? <ComposeAttachments /> : null}
      {composeState.poll.active ? <ComposePoll /> : null}
      {composeState.replyToStatus ? <ComposeReply /> : null}
    </>
  )
}

export default ComposeRootFooter
