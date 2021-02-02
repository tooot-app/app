import { StyleConstants } from '@utils/styles/constants'
import React, { useCallback, useMemo, useState } from 'react'
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native'
import { Blurhash } from 'react-native-blurhash'
import FastImage, { ImageStyle } from 'react-native-fast-image'
import { SharedElement } from 'react-navigation-shared-element'
import { useTheme } from '@utils/styles/ThemeManager'

export interface Props {
  sharedElement?: string
  hidden?: boolean
  uri: { preview?: string; original: string; remote?: string }
  blurhash?: string
  dimension?: { width: number; height: number }
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
}

const GracefullyImage = React.memo(
  ({
    sharedElement,
    hidden = false,
    uri,
    blurhash,
    dimension,
    onPress,
    style,
    imageStyle
  }: Props) => {
    const { mode, theme } = useTheme()
    const [previewLoaded, setPreviewLoaded] = useState(
      uri.preview ? false : true
    )
    const [originalLoaded, setOriginalLoaded] = useState(false)
    const [originalFailed, setOriginalFailed] = useState(false)
    const [remoteLoaded, setRemoteLoaded] = useState(uri.remote ? false : true)

    const sourceUri = useMemo(() => {
      if (previewLoaded) {
        if (originalFailed) {
          return uri.remote
        } else {
          return uri.original
        }
      } else {
        return uri.preview
      }
    }, [previewLoaded, originalLoaded, originalFailed, remoteLoaded])
    const onLoad = useCallback(() => {
      if (previewLoaded) {
        if (originalFailed) {
          return setRemoteLoaded(true)
        } else {
          return setOriginalLoaded(true)
        }
      } else {
        return setPreviewLoaded(true)
      }
    }, [previewLoaded, originalLoaded, originalFailed, remoteLoaded])
    const onError = useCallback(() => {
      if (previewLoaded) {
        if (originalFailed) {
          return
        } else {
          return setOriginalFailed(true)
        }
      } else {
        return
      }
    }, [previewLoaded, originalLoaded, originalFailed, remoteLoaded])

    const children = useCallback(() => {
      return (
        <>
          {sharedElement ? (
            <SharedElement id={`image.${sharedElement}`} style={[styles.image]}>
              <FastImage
                source={{ uri: sourceUri }}
                style={[styles.image, imageStyle]}
                onLoad={onLoad}
                onError={onError}
              />
            </SharedElement>
          ) : (
            <FastImage
              source={{ uri: sourceUri }}
              style={[styles.image, imageStyle]}
              onLoad={onLoad}
              onError={onError}
            />
          )}
          {blurhash &&
          (hidden || !(previewLoaded || originalLoaded || remoteLoaded)) ? (
            <Blurhash
              decodeAsync
              blurhash={blurhash}
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: StyleConstants.Spacing.XS / 2,
                left: StyleConstants.Spacing.XS / 2
              }}
            />
          ) : null}
        </>
      )
    }, [hidden, previewLoaded, originalLoaded, remoteLoaded, mode, uri])

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
  },
  (prev, next) => {
    let skipUpdate = true
    skipUpdate = prev.hidden === next.hidden
    skipUpdate = prev.uri.original === next.uri.original
    return false
  }
)

const styles = StyleSheet.create({
  image: {
    flex: 1
  }
})

export default GracefullyImage
