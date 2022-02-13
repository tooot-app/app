import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useMemo, useState } from 'react'
import {
  AccessibilityProps,
  Image,
  ImageStyle,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from 'react-native'
import { Blurhash } from 'react-native-blurhash'

// blurhas -> if blurhash, show before any loading succeed
// original -> load original
// original, remote -> if original failed, then remote
// preview, original -> first show preview, then original
// preview, original, remote -> first show preview, then original, if original failed, then remote

export interface Props {
  accessibilityLabel?: AccessibilityProps['accessibilityLabel']
  accessibilityHint?: AccessibilityProps['accessibilityHint']

  hidden?: boolean
  uri: { preview?: string; original?: string; remote?: string; static?: string }
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
    accessibilityLabel,
    accessibilityHint,
    hidden = false,
    uri,
    blurhash,
    dimension,
    onPress,
    style,
    imageStyle,
    setImageDimensions
  }: Props) => {
    const { reduceMotionEnabled } = useAccessibility()
    const { colors } = useTheme()
    const [originalFailed, setOriginalFailed] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)

    const source = useMemo(() => {
      if (originalFailed) {
        return { uri: uri.remote || undefined }
      } else {
        return {
          uri: reduceMotionEnabled && uri.static ? uri.static : uri.original
        }
      }
    }, [originalFailed])

    const onLoad = useCallback(() => {
      setImageLoaded(true)
      if (setImageDimensions && source.uri) {
        Image.getSize(source.uri, (width, height) =>
          setImageDimensions({ width, height })
        )
      }
    }, [source.uri])
    const onError = useCallback(() => {
      if (!originalFailed) {
        setOriginalFailed(true)
      }
    }, [originalFailed])

    const previewView = useMemo(
      () =>
        uri.preview && !imageLoaded ? (
          <Image
            fadeDuration={0}
            source={{ uri: uri.preview }}
            style={[
              styles.placeholder,
              { backgroundColor: colors.shimmerDefault }
            ]}
          />
        ) : null,
      []
    )
    const originalView = useMemo(
      () => (
        <Image
          fadeDuration={0}
          source={source}
          style={[{ flex: 1 }, imageStyle]}
          onLoad={onLoad}
          onError={onError}
        />
      ),
      [source]
    )
    const blurhashView = useMemo(() => {
      if (hidden || !imageLoaded) {
        if (blurhash) {
          return (
            <Blurhash
              decodeAsync
              blurhash={blurhash}
              style={styles.placeholder}
            />
          )
        } else {
          return (
            <View
              style={[
                styles.placeholder,
                { backgroundColor: colors.shimmerDefault }
              ]}
            />
          )
        }
      } else {
        return null
      }
    }, [hidden, imageLoaded])

    return (
      <Pressable
        {...(onPress
          ? { accessibilityRole: 'imagebutton' }
          : { accessibilityRole: 'image' })}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={[style, dimension, { backgroundColor: colors.shimmerDefault }]}
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
  placeholder: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  }
})

export default GracefullyImage
