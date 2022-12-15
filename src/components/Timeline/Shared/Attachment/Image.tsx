import GracefullyImage from '@components/GracefullyImage'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { View } from 'react-native'
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
  const { colors } = useTheme()

  return (
    <View
      style={{
        flex: 1,
        flexBasis: '50%',
        padding: StyleConstants.Spacing.XS / 2
      }}
    >
      <View style={{ flex: 1, backgroundColor: colors.shimmerDefault }}>
        <GracefullyImage
          accessibilityLabel={image.description}
          hidden={sensitiveShown}
          uri={{ original: image.preview_url, remote: image.remote_url }}
          blurhash={image.blurhash}
          onPress={() => navigateToImagesViewer(image.id)}
          style={{ aspectRatio: aspectRatio({ total, index, ...image.meta?.original }) }}
        />
      </View>
      <AttachmentAltText sensitiveShown={sensitiveShown} text={image.description} />
    </View>
  )
}

export default AttachmentImage
