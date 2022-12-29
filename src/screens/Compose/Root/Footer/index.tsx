import ComposeAttachments from '@screens/Compose/Root/Footer/Attachments'
import ComposePoll from '@screens/Compose/Root/Footer/Poll'
import ComposeReply from '@screens/Compose/Root/Footer/Reply'
import ComposeContext from '@screens/Compose/utils/createContext'
import React, { RefObject, useContext } from 'react'
import { View } from 'react-native'

export interface Props {
  accessibleRefAttachments: RefObject<View>
}

const ComposeRootFooter: React.FC<Props> = ({ accessibleRefAttachments }) => {
  const { composeState } = useContext(ComposeContext)

  return (
    <View>
      {composeState.attachments.uploads.length ? (
        <ComposeAttachments accessibleRefAttachments={accessibleRefAttachments} />
      ) : null}
      {composeState.poll.active ? <ComposePoll /> : null}
      {composeState.replyToStatus ? <ComposeReply /> : null}
    </View>
  )
}

export default ComposeRootFooter
