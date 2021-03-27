/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import GracefullyImage from '@components/GracefullyImage'
import React, { useState, useCallback } from 'react'
import { Animated, Dimensions, StyleSheet } from 'react-native'
import usePanResponder from '../hooks/usePanResponder'
import { getImageStyles, getImageTransform } from '../utils'

const SCREEN = Dimensions.get('window')
const SCREEN_WIDTH = SCREEN.width
const SCREEN_HEIGHT = SCREEN.height

type Props = {
  imageSrc: Nav.RootStackParamList['Screen-ImagesViewer']['imageUrls'][0]
  onRequestClose: () => void
  onZoom: (isZoomed: boolean) => void
  onLongPress: (
    image: Nav.RootStackParamList['Screen-ImagesViewer']['imageUrls'][0]
  ) => void
  delayLongPress: number
  swipeToCloseEnabled?: boolean
  doubleTapToZoomEnabled?: boolean
}

const ImageItem = ({
  imageSrc,
  onZoom,
  onRequestClose,
  onLongPress,
  delayLongPress,
  doubleTapToZoomEnabled = true
}: Props) => {
  const imageContainer = React.createRef<any>()
  const [imageDimensions, setImageDimensions] = useState({
    width: imageSrc.width || 0,
    height: imageSrc.height || 0
  })
  const [translate, scale] = getImageTransform(imageDimensions, SCREEN)

  const onZoomPerformed = (isZoomed: boolean) => {
    onZoom(isZoomed)
    if (imageContainer?.current) {
      // @ts-ignore
      imageContainer.current.setNativeProps({
        scrollEnabled: !isZoomed
      })
    }
  }

  const onLongPressHandler = useCallback(() => {
    onLongPress(imageSrc)
  }, [imageSrc, onLongPress])

  const [panHandlers, scaleValue, translateValue] = usePanResponder({
    initialScale: scale || 1,
    initialTranslate: translate || { x: 0, y: 0 },
    onZoom: onZoomPerformed,
    doubleTapToZoomEnabled,
    onLongPress: onLongPressHandler,
    delayLongPress,
    onRequestClose
  })

  const imagesStyles = getImageStyles(
    imageDimensions,
    translateValue,
    scaleValue
  )

  return (
    <Animated.ScrollView
      ref={imageContainer}
      style={styles.listItem}
      pagingEnabled
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.imageScrollContainer}
      scrollEnabled={false}
    >
      <Animated.View
        {...panHandlers}
        style={imagesStyles}
        children={
          <GracefullyImage
            uri={{
              original: imageSrc.url,
              remote: imageSrc.remote_url
            }}
            blurhash={imageSrc.blurhash}
            {...((!imageSrc.width || !imageSrc.height) && {
              setImageDimensions
            })}
            style={{ flex: 1 }}
          />
        }
      />
    </Animated.ScrollView>
  )
}

const styles = StyleSheet.create({
  listItem: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT
  },
  imageScrollContainer: {
    height: SCREEN_HEIGHT * 2
  }
})

export default React.memo(ImageItem)
