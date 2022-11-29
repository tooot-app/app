import Button from '@components/Button'
import haptics from '@components/haptics'
import AttachmentAudio from '@components/Timeline/Shared/Attachment/Audio'
import AttachmentImage from '@components/Timeline/Shared/Attachment/Image'
import AttachmentUnsupported from '@components/Timeline/Shared/Attachment/Unsupported'
import AttachmentVideo from '@components/Timeline/Shared/Attachment/Video'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '@utils/navigation/navigators'
import { getInstanceAccount } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { useSelector } from 'react-redux'

export interface Props {
  status: Pick<Mastodon.Status, 'media_attachments' | 'sensitive'>
}

const TimelineAttachment = React.memo(
  ({ status }: Props) => {
    const { t } = useTranslation('componentTimeline')

    const account = useSelector(
      getInstanceAccount,
      (prev, next) =>
        prev.preferences['reading:expand:media'] === next.preferences['reading:expand:media']
    )
    const defaultSensitive = () => {
      switch (account.preferences['reading:expand:media']) {
        case 'show_all':
          return false
        case 'hide_all':
          return true
        default:
          return status.sensitive
      }
    }
    const [sensitiveShown, setSensitiveShown] = useState(defaultSensitive())

    // @ts-ignore
    const imageUrls: RootStackParamList['Screen-ImagesViewer']['imageUrls'] =
      status.media_attachments
        .map(attachment => {
          switch (attachment.type) {
            case 'image':
              return {
                id: attachment.id,
                preview_url: attachment.preview_url,
                url: attachment.url,
                remote_url: attachment.remote_url,
                blurhash: attachment.blurhash,
                width: attachment.meta?.original?.width,
                height: attachment.meta?.original?.height
              }
            default:
              if (
                attachment.preview_url?.endsWith('.jpg') ||
                attachment.preview_url?.endsWith('.jpeg') ||
                attachment.preview_url?.endsWith('.png') ||
                attachment.preview_url?.endsWith('.gif') ||
                attachment.remote_url?.endsWith('.jpg') ||
                attachment.remote_url?.endsWith('.jpeg') ||
                attachment.remote_url?.endsWith('.png') ||
                attachment.remote_url?.endsWith('.gif')
              ) {
                return {
                  id: attachment.id,
                  preview_url: attachment.preview_url,
                  url: attachment.url,
                  remote_url: attachment.remote_url,
                  blurhash: attachment.blurhash,
                  width: attachment.meta?.original?.width,
                  height: attachment.meta?.original?.height
                }
              }
          }
        })
        .filter(i => i)
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
    const navigateToImagesViewer = (id: string) => {
      navigation.navigate('Screen-ImagesViewer', { imageUrls, id })
    }

    return (
      <View>
        <View
          style={{
            marginTop: StyleConstants.Spacing.S,
            flex: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignContent: 'stretch'
          }}
        >
          {status.media_attachments.map((attachment, index) => {
            switch (attachment.type) {
              case 'image':
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
                if (
                  attachment.preview_url?.endsWith('.jpg') ||
                  attachment.preview_url?.endsWith('.jpeg') ||
                  attachment.preview_url?.endsWith('.png') ||
                  attachment.preview_url?.endsWith('.gif') ||
                  attachment.remote_url?.endsWith('.jpg') ||
                  attachment.remote_url?.endsWith('.jpeg') ||
                  attachment.remote_url?.endsWith('.png') ||
                  attachment.remote_url?.endsWith('.gif')
                ) {
                  return (
                    <AttachmentImage
                      key={index}
                      total={status.media_attachments.length}
                      index={index}
                      sensitiveShown={sensitiveShown}
                      // @ts-ignore
                      image={attachment}
                      navigateToImagesViewer={navigateToImagesViewer}
                    />
                  )
                } else {
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
            }
          })}
        </View>

        {defaultSensitive() &&
          (sensitiveShown ? (
            <Pressable
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Button
                type='text'
                content={t('shared.attachment.sensitive.button')}
                overlay
                onPress={() => {
                  layoutAnimation()
                  setSensitiveShown(false)
                  haptics('Light')
                }}
              />
            </Pressable>
          ) : (
            <Button
              type='icon'
              content='EyeOff'
              round
              overlay
              onPress={() => {
                setSensitiveShown(true)
                haptics('Light')
              }}
              style={{
                position: 'absolute',
                top: StyleConstants.Spacing.S * 2,
                left: StyleConstants.Spacing.S
              }}
            />
          ))}
      </View>
    )
  },
  (prev, next) => {
    let isEqual = true

    if (prev.status.media_attachments.length !== next.status.media_attachments.length) {
      isEqual = false
      return isEqual
    }

    prev.status.media_attachments.forEach((attachment, index) => {
      if (attachment.preview_url !== next.status.media_attachments[index].preview_url) {
        isEqual = false
      }
    })

    return isEqual
  }
)

export default TimelineAttachment
