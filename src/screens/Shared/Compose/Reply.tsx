import React, { Dispatch, RefObject } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { StyleConstants } from 'src/utils/styles/constants'
import { useTheme } from 'src/utils/styles/ThemeManager'

import TimelineAttachment from 'src/components/Timelines/Timeline/Shared/Attachment'
import TimelineAvatar from 'src/components/Timelines/Timeline/Shared/Avatar'
import TimelineCard from 'src/components/Timelines/Timeline/Shared/Card'
import TimelineContent from 'src/components/Timelines/Timeline/Shared/Content'
import TimelineHeaderDefault from 'src/components/Timelines/Timeline/Shared/HeaderDefault'

export interface Props {
  replyToStatus: Mastodon.Status
}

const ComposeReply: React.FC<Props> = ({ replyToStatus }) => {
  const { theme } = useTheme()

  return (
    <View style={styles.status}>
      <TimelineAvatar account={replyToStatus.account} />
      <View style={styles.details}>
        <TimelineHeaderDefault status={replyToStatus} />
        {replyToStatus.content.length > 0 && (
          <TimelineContent status={replyToStatus} />
        )}
        {replyToStatus.media_attachments.length > 0 && (
          <TimelineAttachment status={replyToStatus} width={200} />
        )}
        {replyToStatus.card && <TimelineCard card={replyToStatus.card} />}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  status: {
    flex: 1,
    flexDirection: 'row'
  },
  details: {
    flex: 1
  }
})

export default React.memo(ComposeReply, () => true)
