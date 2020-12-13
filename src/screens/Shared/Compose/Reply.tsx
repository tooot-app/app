import React, { useContext } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { useTheme } from '@utils/styles/ThemeManager'

import TimelineAttachment from '@components/Timelines/Timeline/Shared/Attachment'
import TimelineAvatar from '@components/Timelines/Timeline/Shared/Avatar'
import TimelineCard from '@components/Timelines/Timeline/Shared/Card'
import TimelineContent from '@components/Timelines/Timeline/Shared/Content'
import TimelineHeaderDefault from '@components/Timelines/Timeline/Shared/HeaderDefault'
import { ComposeContext } from '@screens/Shared/Compose'
import { StyleConstants } from '@utils/styles/constants'

const ComposeReply: React.FC = () => {
  const {
    composeState: { replyToStatus }
  } = useContext(ComposeContext)
  const { theme } = useTheme()

  const contentWidth =
    Dimensions.get('window').width -
    StyleConstants.Spacing.Global.PagePadding * 2 - // Global page padding on both sides
    StyleConstants.Avatar.S - // Avatar width
    StyleConstants.Spacing.S // Avatar margin to the right

  return (
    <View style={[styles.status, { borderTopColor: theme.border }]}>
      <TimelineAvatar account={replyToStatus!.account} />
      <View style={styles.details}>
        <TimelineHeaderDefault status={replyToStatus!} />
        {replyToStatus!.content.length > 0 && (
          <TimelineContent status={replyToStatus!} />
        )}
        {replyToStatus!.media_attachments.length > 0 && (
          <TimelineAttachment status={replyToStatus!} width={contentWidth} />
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
    paddingTop: StyleConstants.Spacing.Global.PagePadding
  },
  details: {
    flex: 1
  }
})

export default React.memo(ComposeReply, () => true)
