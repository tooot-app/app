import Button from '@components/Button'
import openLink from '@root/utils/openLink'
import { StyleConstants } from '@root/utils/styles/constants'
import { useTheme } from '@root/utils/styles/ThemeManager'
import { Surface } from 'gl-react-expo'
import { Blurhash } from 'gl-react-blurhash'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export interface Props {
  attachment: Mastodon.AttachmentUnknown
}

const AttachmentUnsupported: React.FC<Props> = ({ attachment }) => {
  const { theme } = useTheme()
  return (
    <View style={styles.base}>
      {attachment.blurhash ? (
        <Surface
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%'
          }}
        >
          <Blurhash hash={attachment.blurhash} />
        </Surface>
      ) : null}
      <Text
        style={[
          styles.text,
          { color: attachment.blurhash ? theme.background : theme.primary }
        ]}
      >
        文件不支持
      </Text>
      {attachment.remote_url ? (
        <Button
          type='text'
          content='尝试远程链接'
          size='S'
          overlay
          onPress={async () => await openLink(attachment.remote_url!)}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexBasis: '50%',
    aspectRatio: 16 / 9,
    padding: StyleConstants.Spacing.XS / 2,
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
