import React, { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { StyleConstants } from '@utils/styles/constants'
import GracefullyImage from '@components/GracefullyImage'

export interface Props {
  sensitiveShown: boolean
  image: Mastodon.AttachmentImage
  imageIndex: number
  navigateToImagesViewer: (imageIndex: number) => void
}

const AttachmentImage: React.FC<Props> = ({
  sensitiveShown,
  image,
  imageIndex,
  navigateToImagesViewer
}) => {
  const onPress = useCallback(() => navigateToImagesViewer(imageIndex), [])

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
      style={styles.base}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexBasis: '50%',
    aspectRatio: 16 / 9,
    padding: StyleConstants.Spacing.XS / 2
  }
})

export default React.memo(
  AttachmentImage,
  (prev, next) => prev.sensitiveShown === next.sensitiveShown
)
