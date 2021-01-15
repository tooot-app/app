import { StyleConstants } from '@utils/styles/constants'
import { Surface } from 'gl-react-expo'
import { Blurhash } from 'gl-react-blurhash'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from 'react-native'
import { Image as ImageCache } from 'react-native-expo-image-cache'
import { useTheme } from '@utils/styles/ThemeManager'

type CancelPromise = ((reason?: Error) => void) | undefined
type ImageSize = { width: number; height: number }
interface ImageSizeOperation {
  start: () => Promise<ImageSize>
  cancel: CancelPromise
}
const getImageSize = (uri: string): ImageSizeOperation => {
  let cancel: CancelPromise
  const start = (): Promise<ImageSize> =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
      cancel = reject
      Image.getSize(
        uri,
        (width, height) => {
          cancel = undefined
          resolve({ width, height })
        },
        error => {
          reject(error)
        }
      )
    })

  return { start, cancel }
}

export interface Props {
  hidden?: boolean
  cache?: boolean
  uri: { preview?: string; original?: string; remote?: string }
  blurhash?: string
  dimension?: { width: number; height: number }
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}

const GracefullyImage: React.FC<Props> = ({
  hidden = false,
  cache = false,
  uri,
  blurhash,
  dimension,
  onPress,
  style
}) => {
  const { mode, theme } = useTheme()

  const [imageVisible, setImageVisible] = useState<string>()
  const [imageLoadingFailed, setImageLoadingFailed] = useState(false)
  useEffect(() => {
    let cancel: CancelPromise
    const sideEffect = async (): Promise<void> => {
      try {
        if (uri.preview) {
          const tryPreview = getImageSize(uri.preview)
          cancel = tryPreview.cancel
          const res = await tryPreview.start()
          if (res) {
            setImageVisible(uri.preview)
            return
          }
        }
      } catch (error) {
        if (__DEV__) console.warn('Image preview', error)
      }

      try {
        const tryOriginal = getImageSize(uri.original!)
        cancel = tryOriginal.cancel
        const res = await tryOriginal.start()
        if (res) {
          setImageVisible(uri.original!)
          return
        }
      } catch (error) {
        if (__DEV__) console.warn('Image original', error)
      }

      try {
        if (uri.remote) {
          const tryRemote = getImageSize(uri.remote)
          cancel = tryRemote.cancel
          const res = await tryRemote.start()
          if (res) {
            setImageVisible(uri.remote)
            return
          }
        }
      } catch (error) {
        if (__DEV__) console.warn('Image remote', error)
      }

      setImageLoadingFailed(true)
    }

    if (uri.original) {
      sideEffect()
    }

    return () => {
      if (cancel) {
        cancel()
      }
    }
  }, [uri])

  const children = useCallback(() => {
    if (imageVisible && !hidden) {
      if (cache) {
        return <ImageCache uri={imageVisible} style={styles.image} />
      } else {
        return <Image source={{ uri: imageVisible }} style={styles.image} />
      }
    } else if (blurhash) {
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
          <Blurhash hash={blurhash} />
        </Surface>
      )
    } else {
      return (
        <View
          style={[styles.image, { backgroundColor: theme.shimmerDefault }]}
        />
      )
    }
  }, [hidden, mode, imageVisible])

  return (
    <Pressable
      children={children}
      style={[style, dimension && { ...dimension }]}
      {...(onPress
        ? !imageVisible
          ? { disabled: true }
          : { onPress }
        : { disabled: true })}
    />
  )
}

const styles = StyleSheet.create({
  image: {
    flex: 1
  }
})

export default GracefullyImage
