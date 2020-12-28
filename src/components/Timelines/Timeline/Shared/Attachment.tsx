import React, { useCallback, useMemo, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'

import AttachmentImage from '@root/components/Timelines/Timeline/Shared/Attachment/Image'
import AttachmentVideo from '@root/components/Timelines/Timeline/Shared/Attachment/Video'
import { IImageInfo } from 'react-native-image-zoom-viewer/built/image-viewer.type'
import { useNavigation } from '@react-navigation/native'
import AttachmentUnsupported from './Attachment/Unsupported'
import AttachmentAudio from './Attachment/Audio'
import layoutAnimation from '@root/utils/styles/layoutAnimation'
import Button from '@root/components/Button'

export interface Props {
  status: Pick<Mastodon.Status, 'media_attachments' | 'sensitive'>
  contentWidth: number
}

const TimelineAttachment: React.FC<Props> = ({ status, contentWidth }) => {
  const { theme } = useTheme()

  const [sensitiveShown, setSensitiveShown] = useState(status.sensitive)
  const onPressBlurView = useCallback(() => {
    layoutAnimation()
    setSensitiveShown(false)
  }, [])

  let imageUrls: (IImageInfo & {
    preview_url: Mastodon.AttachmentImage['preview_url']
    remote_url?: Mastodon.AttachmentImage['remote_url']
    imageIndex: number
  })[] = []
  const navigation = useNavigation()
  const navigateToImagesViewer = (imageIndex: number) =>
    navigation.navigate('Screen-Shared-ImagesViewer', {
      imageUrls,
      imageIndex
    })
  const attachments = useMemo(
    () =>
      status.media_attachments.map((attachment, index) => {
        switch (attachment.type) {
          case 'image':
            imageUrls.push({
              url: attachment.url,
              width: attachment.meta?.original?.width,
              height: attachment.meta?.original?.height,
              preview_url: attachment.preview_url,
              remote_url: attachment.remote_url,
              imageIndex: index
            })
            return (
              <AttachmentImage
                key={index}
                sensitiveShown={sensitiveShown}
                image={attachment}
                imageIndex={index}
                navigateToImagesViewer={navigateToImagesViewer}
              />
            )
          case 'video':
            return (
              <AttachmentVideo
                key={index}
                sensitiveShown={sensitiveShown}
                video={attachment}
                width={contentWidth}
                height={(contentWidth / 16) * 9}
              />
            )
          case 'gifv':
            return (
              <AttachmentVideo
                key={index}
                sensitiveShown={sensitiveShown}
                video={attachment}
                width={contentWidth}
                height={(contentWidth / 16) * 9}
              />
            )
          case 'audio':
            return (
              <AttachmentAudio
                key={index}
                sensitiveShown={sensitiveShown}
                audio={attachment}
              />
            )
          default:
            return <AttachmentUnsupported key={index} attachment={attachment} />
        }
      }),
    [sensitiveShown]
  )

  return (
    <View style={styles.base}>
      {attachments}

      {status.sensitive &&
        (sensitiveShown ? (
          <Pressable style={styles.sensitiveBlur}>
            <Button
              type='text'
              content='显示敏感内容'
              overlay
              onPress={onPressBlurView}
            />
          </Pressable>
        ) : (
          <Button
            type='icon'
            content='eye-off'
            round
            overlay
            onPress={() => setSensitiveShown(!sensitiveShown)}
            style={{
              position: 'absolute',
              top: StyleConstants.Spacing.S,
              left: StyleConstants.Spacing.S
            }}
          />
        ))}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    marginTop: StyleConstants.Spacing.S,
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'stretch'
  },
  container: {
    flexBasis: '50%',
    aspectRatio: 16 / 9
  },
  sensitiveBlur: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sensitiveBlurButton: {
    padding: StyleConstants.Spacing.S,
    borderRadius: 6
  },
  sensitiveText: {
    ...StyleConstants.FontStyle.M
  }
})

export default React.memo(TimelineAttachment, () => true)
