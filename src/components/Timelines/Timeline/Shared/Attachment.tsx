import { BlurView } from 'expo-blur'
import React, { useCallback, useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { StyleConstants } from 'src/utils/styles/constants'
import { useTheme } from 'src/utils/styles/ThemeManager'

import AttachmentImage from './Attachment/AttachmentImage'
import AttachmentVideo from './Attachment/AttachmentVideo'

export interface Props {
  status: Pick<Mastodon.Status, 'media_attachments' | 'sensitive'>
  width: number
}

const TimelineAttachment: React.FC<Props> = ({ status, width }) => {
  const { mode, theme } = useTheme()
  const allTypes = status.media_attachments.map(m => m.type)
  let attachment
  let attachmentHeight

  if (allTypes.includes('image')) {
    attachment = (
      <AttachmentImage
        media_attachments={status.media_attachments}
        width={width}
      />
    )
    attachmentHeight = (width / 16) * 9
  } else if (allTypes.includes('gifv')) {
    attachment = (
      <AttachmentVideo
        media_attachments={status.media_attachments}
        width={width}
      />
    )
    attachmentHeight =
      status.media_attachments[0].meta?.original?.width &&
      status.media_attachments[0].meta?.original?.height
        ? (width / status.media_attachments[0].meta.original.width) *
          status.media_attachments[0].meta.original.height
        : (width / 16) * 9
  } else if (allTypes.includes('video')) {
    attachment = (
      <AttachmentVideo
        media_attachments={status.media_attachments}
        width={width}
      />
    )
    attachmentHeight =
      status.media_attachments[0].meta?.original?.width &&
      status.media_attachments[0].meta?.original?.height
        ? (width / status.media_attachments[0].meta.original.width) *
          status.media_attachments[0].meta.original.height
        : (width / 16) * 9
  } else if (allTypes.includes('audio')) {
    //   attachment = (
    //     <AttachmentAudio
    //       media_attachments={media_attachments}
    //       sensitive={sensitive}
    //       width={width}
    //     />
    //   )
  } else {
    attachment = <Text>文件不支持</Text>
    attachmentHeight = 25
  }

  const [sensitiveShown, setSensitiveShown] = useState(true)
  const onPressBlurView = useCallback(() => {
    setSensitiveShown(false)
  }, [])
  useEffect(() => {
    if (status.sensitive && sensitiveShown === false) {
      setTimeout(() => {
        setSensitiveShown(true)
      }, 10000)
    }
  }, [sensitiveShown])

  return (
    <View
      style={{
        width: width + StyleConstants.Spacing.XS,
        height: attachmentHeight,
        marginTop: StyleConstants.Spacing.S,
        marginLeft: -StyleConstants.Spacing.XS / 2
      }}
    >
      {attachment}
      {status.sensitive && sensitiveShown && (
        <BlurView tint={mode} intensity={100} style={styles.blurView}>
          <Pressable onPress={onPressBlurView} style={styles.blurViewPressable}>
            <Text style={[styles.sensitiveText, { color: theme.primary }]}>
              显示敏感内容
            </Text>
          </Pressable>
        </BlurView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  blurView: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  blurViewPressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sensitiveText: {
    fontSize: StyleConstants.Font.Size.M
  }
})

export default React.memo(TimelineAttachment, () => true)
