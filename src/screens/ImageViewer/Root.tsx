/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { ComponentType, useCallback, useEffect } from 'react'
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
  VirtualizedList
} from 'react-native'
import ImageItem from './components/ImageItem'
import useAnimatedComponents from './hooks/useAnimatedComponents'
import useImageIndexChange from './hooks/useImageIndexChange'
import useRequestClose from './hooks/useRequestClose'

type Props = {
  images: Nav.RootStackParamList['Screen-ImagesViewer']['imageUrls']
  imageIndex: number
  onRequestClose: () => void
  onLongPress?: (
    image: Nav.RootStackParamList['Screen-ImagesViewer']['imageUrls'][0]
  ) => void
  onImageIndexChange?: (imageIndex: number) => void
  backgroundColor?: string
  swipeToCloseEnabled?: boolean
  delayLongPress?: number
  HeaderComponent: ComponentType<{ imageIndex: number }>
}

const DEFAULT_BG_COLOR = '#000'
const DEFAULT_DELAY_LONG_PRESS = 800
const SCREEN = Dimensions.get('screen')
const SCREEN_WIDTH = SCREEN.width

function ImageViewer ({
  images,
  imageIndex,
  onRequestClose,
  onLongPress = () => {},
  onImageIndexChange,
  backgroundColor = DEFAULT_BG_COLOR,
  swipeToCloseEnabled,
  delayLongPress = DEFAULT_DELAY_LONG_PRESS,
  HeaderComponent
}: Props) {
  const imageList = React.createRef<
    VirtualizedList<
      Nav.RootStackParamList['Screen-ImagesViewer']['imageUrls'][0]
    >
  >()
  const [opacity, onRequestCloseEnhanced] = useRequestClose(onRequestClose)
  const [currentImageIndex, onScroll] = useImageIndexChange(imageIndex, SCREEN)
  const [headerTransform, toggleBarsVisible] = useAnimatedComponents()

  useEffect(() => {
    if (onImageIndexChange) {
      onImageIndexChange(currentImageIndex)
    }
  }, [currentImageIndex])

  const onZoom = useCallback(
    (isScaled: boolean) => {
      // @ts-ignore
      imageList?.current?.setNativeProps({ scrollEnabled: !isScaled })
      toggleBarsVisible(!isScaled)
    },
    [imageList]
  )

  return (
    <View style={[styles.container, { opacity, backgroundColor }]}>
      <Animated.View style={[styles.header, { transform: headerTransform }]}>
        {React.createElement(HeaderComponent, {
          imageIndex: currentImageIndex
        })}
      </Animated.View>
      <VirtualizedList
        ref={imageList}
        data={images}
        horizontal
        pagingEnabled
        windowSize={2}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        initialScrollIndex={
          imageIndex > images.length - 1 ? images.length - 1 : imageIndex
        }
        getItem={(_, index) => images[index]}
        getItemCount={() => images.length}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index
        })}
        renderItem={({ item: imageSrc }) => (
          <ImageItem
            onZoom={onZoom}
            imageSrc={imageSrc}
            onRequestClose={onRequestCloseEnhanced}
            onLongPress={onLongPress}
            delayLongPress={delayLongPress}
            swipeToCloseEnabled={swipeToCloseEnabled}
          />
        )}
        onMomentumScrollEnd={onScroll}
        keyExtractor={imageSrc => imageSrc.url}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  header: {
    position: 'absolute',
    width: '100%',
    zIndex: 1,
    top: 0
  }
})

export default ImageViewer
