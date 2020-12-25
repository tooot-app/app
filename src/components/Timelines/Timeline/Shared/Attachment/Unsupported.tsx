import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ButtonRow } from '@components/Button'
import { useTheme } from '@root/utils/styles/ThemeManager'
import { StyleConstants } from '@root/utils/styles/constants'
import openLink from '@root/utils/openLink'

export interface Props {
  attachment: Mastodon.Attachment
}

const AttachmentUnsupported: React.FC<Props> = ({ attachment }) => {
  const { theme } = useTheme()
  return (
    <View style={styles.base}>
      <Text style={[styles.text, { color: theme.primary }]}>文件不支持</Text>
      {attachment.remote_url ? (
        <ButtonRow
          text='尝试远程链接'
          size='S'
          onPress={async () => await openLink(attachment.remote_url!)}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontSize: StyleConstants.Font.Size.S,
    textAlign: 'center',
    marginBottom: StyleConstants.Spacing.S
  }
})

export default AttachmentUnsupported
