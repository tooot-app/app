import React, { useContext } from 'react'
import { StyleSheet, View } from 'react-native'
import { StyleConstants } from '@utils/styles/constants'
import { ComposeContext } from '@screens/Shared/Compose'
import ComposeAttachments from '@screens/Shared/Compose/Attachments'
import ComposeEmojis from '@screens/Shared/Compose/Emojis'
import ComposePoll from '@screens/Shared/Compose/Poll'
import ComposeReply from '@screens/Shared/Compose/Reply'

const ComposeRootFooter: React.FC = () => {
  const { composeState } = useContext(ComposeContext)
  console.log(composeState)
  return (
    <>
      {composeState.emoji.active && (
        <View style={styles.emojis}>
          <ComposeEmojis />
        </View>
      )}

      {(composeState.attachments.uploads.length > 0 ||
        composeState.attachmentUploadProgress) && (
        <View style={styles.attachments}>
          <ComposeAttachments />
        </View>
      )}

      {composeState.poll.active && (
        <View style={styles.poll} key='poll'>
          <ComposePoll />
        </View>
      )}

      {composeState.replyToStatus && (
        <View style={styles.reply}>
          <ComposeReply />
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  emojis: {
    flex: 1
  },
  attachments: {
    flex: 1
  },
  poll: {
    flex: 1,
    padding: StyleConstants.Spacing.Global.PagePadding
  },
  reply: {
    flex: 1,
    padding: StyleConstants.Spacing.Global.PagePadding
  }
})

export default ComposeRootFooter
