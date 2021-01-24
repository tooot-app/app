import analytics from '@components/analytics'
import GracefullyImage from '@components/GracefullyImage'
import { StyleConstants } from '@utils/styles/constants'
import React, { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import attachmentAspectRatio from './aspectRatio'

export interface Props {
  total: number
  index: number
  sensitiveShown: boolean
  image: Mastodon.AttachmentImage
  navigateToImagesViewer: (imageIndex: number) => void
}

const AttachmentImage: React.FC<Props> = ({
  total,
  index,
  sensitiveShown,
  image,
  navigateToImagesViewer
}) => {
  const onPress = useCallback(() => {
    analytics('timeline_shared_attachment_image_press', { id: image.id })
    navigateToImagesViewer(index)
  }, [])

  return (
    <GracefullyImage
      hidden={sensitiveShown}
      uri={{
        preview: image.preview_url,
        original: image.url,
        remote: image.remote_url
      }}
      blurhash={image.blurhash}
      onPress={onPress}
      style={[
        styles.base,
        { aspectRatio: attachmentAspectRatio({ total, index }) }
      ]}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexBasis: '50%',
    padding: StyleConstants.Spacing.XS / 2
  }
})

export default React.memo(
  AttachmentImage,
  (prev, next) => prev.sensitiveShown === next.sensitiveShown
)
