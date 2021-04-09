import ComposeAttachments from '@screens/Compose/Root/Footer/Attachments'
import ComposeEmojis from '@screens/Compose/Root/Footer/Emojis'
import ComposePoll from '@screens/Compose/Root/Footer/Poll'
import ComposeReply from '@screens/Compose/Root/Footer/Reply'
import ComposeContext from '@screens/Compose/utils/createContext'
import React, { RefObject, useContext } from 'react'
import { SectionList, View } from 'react-native'

export interface Props {
  accessibleRefAttachments: RefObject<View>
  accessibleRefEmojis: RefObject<SectionList>
}

const ComposeRootFooter: React.FC<Props> = ({
  accessibleRefAttachments,
  accessibleRefEmojis
}) => {
  const { composeState } = useContext(ComposeContext)

  return (
    <>
      {composeState.emoji.active ? (
        <ComposeEmojis accessibleRefEmojis={accessibleRefEmojis} />
      ) : null}
      {composeState.attachments.uploads.length ? (
        <ComposeAttachments
          accessibleRefAttachments={accessibleRefAttachments}
        />
      ) : null}
      {composeState.poll.active ? <ComposePoll /> : null}
      {composeState.replyToStatus ? <ComposeReply /> : null}
    </>
  )
}

export default ComposeRootFooter
