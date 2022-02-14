import analytics from '@components/analytics'
import GracefullyImage from '@components/GracefullyImage'
import { StyleConstants } from '@utils/styles/constants'
import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import attachmentAspectRatio from './aspectRatio'

export interface Props {
  total: number
  index: number
  sensitiveShown: boolean
  image: Mastodon.AttachmentImage
  navigateToImagesViewer: (imageIndex: string) => void
}

const AttachmentImage = React.memo(
  ({ total, index, sensitiveShown, image, navigateToImagesViewer }: Props) => {
    const onPress = useCallback(() => {
      analytics('timeline_shared_attachment_image_press', { id: image.id })
      navigateToImagesViewer(image.id)
    }, [])

    return (
      <View style={styles.base}>
        <GracefullyImage
          accessibilityLabel={image.description}
          hidden={sensitiveShown}
          uri={{ original: image.preview_url, remote: image.remote_url }}
          blurhash={image.blurhash}
          onPress={onPress}
          style={{
            aspectRatio:
              total > 1 ||
              !image.meta?.original?.width ||
              !image.meta?.original?.height
                ? attachmentAspectRatio({ total, index })
                : image.meta.original.height / image.meta.original.width > 1
                ? 1
                : image.meta.original.width / image.meta.original.height
          }}
        />
      </View>
    )
  },
  (prev, next) => prev.sensitiveShown === next.sensitiveShown
)

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexBasis: '50%',
    padding: StyleConstants.Spacing.XS / 2
  }
})

export default AttachmentImage
