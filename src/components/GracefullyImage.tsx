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
interface ImageSizeOperation {
  start: () => Promise<string>
  cancel: CancelPromise
}
const getImageSize = ({
  preview,
  original,
  remote
}: {
  preview?: string
  original: string
  remote?: string
}): ImageSizeOperation => {
  let cancel: CancelPromise
  const start = (): Promise<string> =>
    new Promise<string>((resolve, reject) => {
      cancel = reject
      Image.getSize(
        preview || '',
        () => {
          cancel = undefined
          resolve(preview!)
        },
        () => {
          cancel = reject
          Image.getSize(
            original,
            () => {
              cancel = undefined
              resolve(original)
            },
            () => {
              cancel = reject
              if (!remote) {
                reject()
              } else {
                Image.getSize(
                  remote,
                  () => {
                    cancel = undefined
                    resolve(remote)
                  },
                  error => {
                    reject(error)
                  }
                )
              }
            }
          )
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

  useEffect(() => {
    let mounted = true
    let cancel: CancelPromise
    const sideEffect = async (): Promise<void> => {
      try {
        const prefetchImage = getImageSize(uri as { original: string })
        cancel = prefetchImage.cancel
        const res = await prefetchImage.start()
        if (mounted) {
          setImageVisible(res)
        }
        return
      } catch (error) {
        if (__DEV__) console.warn('Image preview', error)
      }
    }

    if (uri.original) {
      sideEffect()
    }

    return () => {
      mounted = false
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
        ? hidden
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
