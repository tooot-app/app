import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { connectMedia } from '@utils/api/helpers/connect'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect, useState } from 'react'
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
  dim?: boolean
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
  setImageDimensions,
  dim
}: Props) => {
  const { reduceMotionEnabled } = useAccessibility()
  const { colors, theme } = useTheme()
  const [imageLoaded, setImageLoaded] = useState(false)

  const [currentUri, setCurrentUri] = useState<string | undefined>(uri.original || uri.remote)
  const source: { uri?: string } = {
    uri: reduceMotionEnabled && uri.static ? uri.static : currentUri
  }
  useEffect(() => {
    if (
      (uri.original ? currentUri !== uri.original : true) &&
      (uri.remote ? currentUri !== uri.remote : true)
    ) {
      setCurrentUri(uri.original || uri.remote)
    }
  }, [currentUri, uri.original, uri.remote])

  const blurhashView = () => {
    if (hidden || !imageLoaded) {
      if (blurhash) {
        return <Blurhash decodeAsync blurhash={blurhash} style={styles.placeholder} />
      } else {
        return <View style={[styles.placeholder, { backgroundColor: colors.shimmerDefault }]} />
      }
    } else {
      return null
    }
  }

  return (
    <Pressable
      {...(onPress ? { accessibilityRole: 'imagebutton' } : { accessibilityRole: 'image' })}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={[style, dimension]}
      {...(onPress ? (hidden ? { disabled: true } : { onPress }) : { disabled: true })}
    >
      {uri.preview && !imageLoaded ? (
        <FastImage
          source={connectMedia({ uri: uri.preview })}
          enterTransition='fadeIn'
          transitionDuration={60}
          style={[styles.placeholder]}
        />
      ) : null}
      <FastImage
        source={connectMedia(source)}
        enterTransition='fadeIn'
        transitionDuration={60}
        style={[{ flex: 1 }, imageStyle]}
        onLoad={() => {
          setImageLoaded(true)
          if (setImageDimensions && source.uri) {
            Image.getSize(source.uri, (width, height) => setImageDimensions({ width, height }))
          }
        }}
        onError={() => {
          if (uri.original && uri.original === currentUri && uri.remote) {
            setCurrentUri(uri.remote)
          }
        }}
      />
      {blurhashView()}
      {dim && theme !== 'light' ? (
        <View
          style={[
            styles.placeholder,
            { backgroundColor: 'black', opacity: theme === 'dark_lighter' ? 0.18 : 0.36 }
          ]}
        />
      ) : null}
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
