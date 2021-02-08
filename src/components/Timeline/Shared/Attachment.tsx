import analytics from '@components/analytics'
import Button from '@components/Button'
import haptics from '@components/haptics'
import AttachmentAudio from '@components/Timeline/Shared/Attachment/Audio'
import AttachmentImage from '@components/Timeline/Shared/Attachment/Image'
import AttachmentUnsupported from '@components/Timeline/Shared/Attachment/Unsupported'
import AttachmentVideo from '@components/Timeline/Shared/Attachment/Video'
import { useNavigation } from '@react-navigation/native'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'

export interface Props {
  status: Pick<Mastodon.Status, 'media_attachments' | 'sensitive'>
}

const TimelineAttachment: React.FC<Props> = ({ status }) => {
  const { t } = useTranslation('componentTimeline')

  const [sensitiveShown, setSensitiveShown] = useState(status.sensitive)
  const onPressBlurView = useCallback(() => {
    analytics('timeline_shared_attachment_blurview_press_show')
    layoutAnimation()
    setSensitiveShown(false)
    haptics('Light')
  }, [])
  const onPressShow = useCallback(() => {
    analytics('timeline_shared_attachment_blurview_press_hide')
    setSensitiveShown(true)
    haptics('Light')
  }, [])

  let imageUrls: (App.IImageInfo & {
    preview_url: Mastodon.AttachmentImage['preview_url']
    remote_url?: Mastodon.AttachmentImage['remote_url']
    imageIndex: number
  })[] = []
  const navigation = useNavigation()
  const navigateToImagesViewer = (imageIndex: number) =>
    navigation.navigate('Screen-ImagesViewer', {
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
                total={status.media_attachments.length}
                index={index}
                sensitiveShown={sensitiveShown}
                image={attachment}
                navigateToImagesViewer={navigateToImagesViewer}
              />
            )
          case 'video':
            return (
              <AttachmentVideo
                key={index}
                total={status.media_attachments.length}
                index={index}
                sensitiveShown={sensitiveShown}
                video={attachment}
              />
            )
          case 'gifv':
            return (
              <AttachmentVideo
                key={index}
                total={status.media_attachments.length}
                index={index}
                sensitiveShown={sensitiveShown}
                video={attachment}
                gifv
              />
            )
          case 'audio':
            return (
              <AttachmentAudio
                key={index}
                total={status.media_attachments.length}
                index={index}
                sensitiveShown={sensitiveShown}
                audio={attachment}
              />
            )
          default:
            return (
              <AttachmentUnsupported
                key={index}
                total={status.media_attachments.length}
                index={index}
                sensitiveShown={sensitiveShown}
                attachment={attachment}
              />
            )
        }
      }),
    [sensitiveShown]
  )

  return (
    <View>
      <View style={styles.container} children={attachments} />

      {status.sensitive &&
        (sensitiveShown ? (
          <Pressable style={styles.sensitiveBlur}>
            <Button
              type='text'
              content={t('shared.attachment.sensitive.button')}
              overlay
              onPress={onPressBlurView}
            />
          </Pressable>
        ) : (
          <Button
            type='icon'
            content='EyeOff'
            round
            overlay
            onPress={onPressShow}
            style={{
              position: 'absolute',
              top: StyleConstants.Spacing.S * 2,
              left: StyleConstants.Spacing.S
            }}
          />
        ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: StyleConstants.Spacing.S,
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'stretch'
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
