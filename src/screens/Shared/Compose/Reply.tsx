import TimelineAttachment from '@components/Timelines/Timeline/Shared/Attachment'
import TimelineAvatar from '@components/Timelines/Timeline/Shared/Avatar'
import TimelineCard from '@components/Timelines/Timeline/Shared/Card'
import TimelineContent from '@components/Timelines/Timeline/Shared/Content'
import TimelineHeaderDefault from '@components/Timelines/Timeline/Shared/HeaderDefault'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import ComposeContext from './utils/createContext'
import React, { useContext } from 'react'
import { StyleSheet, View } from 'react-native'

const ComposeReply: React.FC = () => {
  const {
    composeState: { replyToStatus }
  } = useContext(ComposeContext)
  const { theme } = useTheme()

  return (
    <View style={[styles.status, { borderTopColor: theme.border }]}>
      <TimelineAvatar account={replyToStatus!.account} />
      <View style={styles.details}>
        <TimelineHeaderDefault status={replyToStatus!} sameAccount={false} />
        {replyToStatus!.content.length > 0 && (
          <TimelineContent status={replyToStatus!} />
        )}
        {replyToStatus!.media_attachments.length > 0 && (
          <TimelineAttachment status={replyToStatus!} />
        )}
        {replyToStatus!.card && <TimelineCard card={replyToStatus!.card} />}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  status: {
    flex: 1,
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: StyleConstants.Spacing.Global.PagePadding,
    margin: StyleConstants.Spacing.Global.PagePadding
  },
  details: {
    flex: 1
  }
})

export default React.memo(ComposeReply, () => true)
