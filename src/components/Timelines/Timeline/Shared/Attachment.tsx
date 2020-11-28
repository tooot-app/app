import React from 'react'
import { Text, View } from 'react-native'

import AttachmentImage from './Attachment/AttachmentImage'
import AttachmentVideo from './Attachment/AttachmentVideo'

export interface Props {
  media_attachments: Mastodon.Attachment[]
  sensitive: boolean
  width: number
}

const Attachment: React.FC<Props> = ({
  media_attachments,
  sensitive,
  width
}) => {
  let attachment
  let attachmentHeight
  // if (width) {}
  switch (media_attachments[0].type) {
    case 'unknown':
      attachment = <Text>文件不支持</Text>
      attachmentHeight = 25
      break
    case 'image':
      attachment = (
        <AttachmentImage
          media_attachments={media_attachments}
          sensitive={sensitive}
          width={width}
        />
      )
      attachmentHeight = width / 2
      break
    case 'gifv':
      attachment = (
        <AttachmentVideo
          media_attachments={media_attachments}
          sensitive={sensitive}
          width={width}
        />
      )
      attachmentHeight =
        (width / media_attachments[0].meta.original.width) *
        media_attachments[0].meta.original.height
      break
    // Support multiple video
    // Supoort when video meta is empty
    // case 'video':
    //   attachment = (
    //     <AttachmentVideo
    //       media_attachments={media_attachments}
    //       sensitive={sensitive}
    //       width={width}
    //     />
    //   )
    //   attachmentHeight =
    //     (width / media_attachments[0].meta.original.width) *
    //     media_attachments[0].meta.original.height
    //   break
    // case 'audio':
    //   attachment = (
    //     <AttachmentAudio
    //       media_attachments={media_attachments}
    //       sensitive={sensitive}
    //       width={width}
    //     />
    //   )
    //   break
  }

  return (
    <View
      style={{
        width: width + 8,
        height: attachmentHeight,
        marginTop: 4,
        marginLeft: -4
      }}
    >
      {attachment}
    </View>
  )
}

export default React.memo(Attachment, () => true)
