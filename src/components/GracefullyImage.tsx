import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useMemo, useState } from 'react'
import {
  AccessibilityProps,
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from 'react-native'
import { Blurhash } from 'react-native-blurhash'
import FastImage, { ImageStyle } from 'react-native-fast-image'

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

const GracefullyImage = ({
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
  const [imageLoaded, setImageLoaded] = useState(false)

  const source = {
    uri: reduceMotionEnabled && uri.static ? uri.static : uri.original
  }
  const onLoad = () => {
    setImageLoaded(true)
    if (setImageDimensions && source.uri) {
      Image.getSize(source.uri, (width, height) => setImageDimensions({ width, height }))
    }
  }

  const blurhashView = useMemo(() => {
    if (hidden || !imageLoaded) {
      if (blurhash) {
        return <Blurhash decodeAsync blurhash={blurhash} style={styles.placeholder} />
      } else {
        return <View style={[styles.placeholder, { backgroundColor: colors.shimmerDefault }]} />
      }
    } else {
      return null
    }
  }, [hidden, imageLoaded])

  return (
    <Pressable
      {...(onPress ? { accessibilityRole: 'imagebutton' } : { accessibilityRole: 'image' })}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={[style, dimension, { backgroundColor: colors.shimmerDefault }]}
      {...(onPress ? (hidden ? { disabled: true } : { onPress }) : { disabled: true })}
    >
      {uri.preview && !imageLoaded ? (
        <FastImage
          source={{ uri: uri.preview }}
          style={[styles.placeholder, { backgroundColor: colors.shimmerDefault }]}
        />
      ) : null}
      <FastImage
        source={{
          uri: reduceMotionEnabled && uri.static ? uri.static : uri.original
        }}
        style={[{ flex: 1 }, imageStyle]}
        onLoad={onLoad}
      />
      {blurhashView}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  placeholder: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  }
})

export default GracefullyImage
