import React, { useContext } from 'react'
import ComposeAttachments from '@screens/Compose/Root/Footer/Attachments'
import ComposeEmojis from '@screens/Compose/Root/Footer/Emojis'
import ComposePoll from '@screens/Compose/Root/Footer/Poll'
import ComposeReply from '@screens/Compose/Root/Footer/Reply'
import ComposeContext from '@screens/Compose/utils/createContext'

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
