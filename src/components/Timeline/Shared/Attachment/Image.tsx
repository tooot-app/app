import GracefullyImage from '@components/GracefullyImage'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { View } from 'react-native'
import StatusContext from '../Context'
import AttachmentAltText from './AltText'
import { aspectRatio } from './dimensions'

export interface Props {
  total: number
  index: number
  sensitiveShown: boolean
  image: Mastodon.AttachmentImage
  navigateToImagesViewer: (imageIndex: string) => void
}

const AttachmentImage = ({
  total,
  index,
  sensitiveShown,
  image,
  navigateToImagesViewer
}: Props) => {
  const { inThread } = useContext(StatusContext)
  const { colors } = useTheme()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.shimmerDefault,
        alignContent: 'center',
        justifyContent: 'center',
        borderRadius: StyleConstants.BorderRadius / 2,
        overflow: 'hidden'
      }}
    >
      <GracefullyImage
        accessibilityLabel={image.description}
        hidden={sensitiveShown}
        sources={{
          default: { uri: image.preview_url },
          remote: { uri: image.remote_url },
          blurhash: image.blurhash
        }}
        onPress={() => navigateToImagesViewer(image.id)}
        style={{ aspectRatio: aspectRatio({ total, index, ...image.meta?.original }) }}
        dim
        withoutTransition={inThread}
      />
      <AttachmentAltText sensitiveShown={sensitiveShown} text={image.description} />
    </View>
  )
}

export default AttachmentImage
