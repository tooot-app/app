import { StyleConstants } from '@utils/styles/constants'
import { Surface } from 'gl-react-expo'
import { Blurhash } from 'gl-react-blurhash'
import React, { useCallback, useState } from 'react'
import {
  ImageStyle,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle
} from 'react-native'
import FastImage from 'react-native-fast-image'
import { useTheme } from '@utils/styles/ThemeManager'

export interface Props {
  hidden?: boolean
  uri: { preview?: string; original: string; remote?: string }
  blurhash?: string
  dimension?: { width: number; height: number }
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
}

const GracefullyImage: React.FC<Props> = ({
  hidden = false,
  uri,
  blurhash,
  dimension,
  onPress,
  style,
  imageStyle
}) => {
  const { mode, theme } = useTheme()
  const [imageLoaded, setImageLoaded] = useState(false)

  const children = useCallback(() => {
    return (
      <>
        <FastImage
          source={{ uri: uri.preview || uri.original || uri.remote }}
          style={[styles.image, imageStyle]}
          onLoad={() => setImageLoaded(true)}
        />
        {blurhash && (hidden || !imageLoaded) ? (
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
        ) : null}
      </>
    )
  }, [hidden, imageLoaded, mode, uri])

  return (
    <Pressable
      children={children}
      style={[
        style,
        { backgroundColor: theme.shimmerDefault },
        dimension && { ...dimension }
      ]}
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
