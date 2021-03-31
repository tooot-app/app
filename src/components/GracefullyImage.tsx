import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  Image,
  ImageStyle,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle
} from 'react-native'
import { Blurhash } from 'react-native-blurhash'

// blurhas -> if blurhash, show before any loading succeed
// original -> load original
// original, remote -> if original failed, then remote
// preview, original -> first show preview, then original
// preview, original, remote -> first show preview, then original, if original failed, then remote

export interface Props {
  hidden?: boolean
  uri: { preview?: string; original?: string; remote?: string }
  blurhash?: string
  dimension?: { width: number; height: number }
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
  // For image viewer when there is no image size available
  setImageDimensions?: React.Dispatch<
    React.SetStateAction<{
      width: number
      height: number
    }>
  >
}

const GracefullyImage = React.memo(
  ({
    hidden = false,
    uri,
    blurhash,
    dimension,
    onPress,
    style,
    imageStyle,
    setImageDimensions
  }: Props) => {
    const { theme } = useTheme()
    const originalFailed = useRef(false)
    const [imageLoaded, setImageLoaded] = useState(false)

    const source = useMemo(() => {
      if (originalFailed.current) {
        return { uri: uri.remote || undefined }
      } else {
        return { uri: uri.original }
      }
    }, [originalFailed.current])
    const onLoad = useCallback(
      ({ nativeEvent }) => {
        setImageLoaded(true)
        setImageDimensions &&
          setImageDimensions({
            width: nativeEvent.width,
            height: nativeEvent.height
          })
      },
      [source.uri]
    )
    const onError = useCallback(() => {
      if (!originalFailed.current) {
        originalFailed.current = true
      }
    }, [originalFailed.current])

    const previewView = useMemo(
      () =>
        uri.preview && !imageLoaded ? (
          <Image
            source={{ uri: uri.preview }}
            style={[{ flex: 1 }, imageStyle]}
          />
        ) : null,
      [imageLoaded]
    )
    const originalView = useMemo(
      () => (
        <Image
          source={source}
          style={[{ flex: 1 }, imageStyle]}
          onLoad={onLoad}
          onError={onError}
        />
      ),
      [source]
    )
    const blurhashView = useMemo(() => {
      return blurhash && (hidden || !imageLoaded) ? (
        <Blurhash decodeAsync blurhash={blurhash} style={styles.blurhash} />
      ) : null
    }, [hidden, imageLoaded])

    return (
      <Pressable
        style={[style, dimension, { backgroundColor: theme.shimmerDefault }]}
        {...(onPress
          ? hidden
            ? { disabled: true }
            : { onPress }
          : { disabled: true })}
      >
        {previewView}
        {originalView}
        {blurhashView}
      </Pressable>
    )
  },
  (prev, next) =>
    prev.hidden === next.hidden &&
    prev.uri.preview === next.uri.preview &&
    prev.uri.original === next.uri.original &&
    prev.uri.remote === next.uri.remote
)

const styles = StyleSheet.create({
  blurhash: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  }
})

export default GracefullyImage
