import React, { useContext } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { StyleConstants } from 'src/utils/styles/constants'
import { ComposeContext } from '../../Compose'
import ComposeAttachments from '../Attachments'
import ComposeEmojis from '../Emojis'
import ComposePoll from '../Poll'
import ComposeReply from '../Reply'

export interface Props {
  textInputRef: React.RefObject<TextInput>
}

const ComposeRootFooter: React.FC<Props> = ({ textInputRef }) => {
  const { composeState, composeDispatch } = useContext(ComposeContext)

  return (
    <>
      {composeState.emoji.active && (
        <View style={styles.emojis}>
          <ComposeEmojis textInputRef={textInputRef} />
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
