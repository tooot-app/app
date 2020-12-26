import { Surface } from 'gl-react-expo'
import { Blurhash } from 'gl-react-blurhash'
import React, { useCallback, useEffect, useState } from 'react'
import { Image, StyleSheet, Pressable } from 'react-native'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@root/utils/styles/layoutAnimation'

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
  layoutAnimation()

  let isMounted = false
  useEffect(() => {
    isMounted = true

    return () => {
      isMounted = false
    }
  })
  const [imageVisible, setImageVisible] = useState<string>()
  const [imageLoadingFailed, setImageLoadingFailed] = useState(false)
  useEffect(() => {
    const preFetch = () =>
      isMounted &&
      Image.getSize(
        image.preview_url,
        () => isMounted && setImageVisible(image.preview_url),
        () => {
          isMounted &&
            Image.getSize(
              image.url,
              () => isMounted && setImageVisible(image.url),
              () =>
                image.remote_url
                  ? isMounted &&
                    Image.getSize(
                      image.remote_url,
                      () => isMounted && setImageVisible(image.remote_url),
                      () => isMounted && setImageLoadingFailed(true)
                    )
                  : isMounted && setImageLoadingFailed(true)
            )
        }
      )
    preFetch()
  }, [isMounted])

  const children = useCallback(() => {
    if (imageVisible && !sensitiveShown) {
      return <Image source={{ uri: imageVisible }} style={styles.image} />
    } else {
      return (
        <Surface
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: StyleConstants.Spacing.XS / 2,
            left: StyleConstants.Spacing.XS / 2
          }}
        >
          <Blurhash hash={image.blurhash} />
        </Surface>
      )
    }
  }, [imageVisible, sensitiveShown])
  const onPress = useCallback(() => {
    if (imageVisible && !sensitiveShown) {
      navigateToImagesViewer(imageIndex)
    }
  }, [imageVisible, sensitiveShown])

  return (
    <Pressable
      style={[styles.imageContainer]}
      children={children}
      onPress={onPress}
    />
  )
}

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    flexBasis: '50%',
    padding: StyleConstants.Spacing.XS / 2
  },
  image: {
    flex: 1
  }
})

export default React.memo(
  AttachmentImage,
  (prev, next) => prev.sensitiveShown === next.sensitiveShown
)
