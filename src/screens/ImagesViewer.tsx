import analytics from '@components/analytics'
import { HeaderRight } from '@components/Header'
import { StackScreenProps } from '@react-navigation/stack'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { findIndex } from 'lodash'
import React, { useCallback, useLayoutEffect, useState } from 'react'
import { Platform, Share, StyleSheet, Text } from 'react-native'
import FastImage from 'react-native-fast-image'
import ImageViewer from 'react-native-image-zoom-viewer'
import { SharedElement } from 'react-navigation-shared-element'

export type ScreenImagesViewerProp = StackScreenProps<
  Nav.RootStackParamList,
  'Screen-ImagesViewer'
>

const ScreenImagesViewer = React.memo(
  ({
    route: {
      params: { imageUrls, imageIndex }
    },
    navigation
  }: ScreenImagesViewerProp) => {
    const { theme } = useTheme()
    const [currentIndex, setCurrentIndex] = useState(
      findIndex(imageUrls, ['imageIndex', imageIndex])
    )

    const onPress = useCallback(() => {
      analytics('imageviewer_share_press')
      switch (Platform.OS) {
        case 'ios':
          return Share.share({ url: imageUrls[currentIndex].url })
        case 'android':
          return Share.share({ message: imageUrls[currentIndex].url })
      }
    }, [currentIndex])

    useLayoutEffect(
      () =>
        navigation.setOptions({
          headerTitle: () => (
            <Text
              style={[styles.headerCenter, { color: theme.primaryOverlay }]}
            >
              {currentIndex + 1} / {imageUrls.length}
            </Text>
          ),
          headerRight: () => (
            <HeaderRight content='Share' native={false} onPress={onPress} />
          )
        }),
      [currentIndex]
    )

    const renderImage = useCallback(
      prop => (
        <SharedElement id={`image.${imageUrls[imageIndex].url}`}>
          <FastImage {...prop} resizeMode={'contain'} />
        </SharedElement>
      ),
      []
    )

    return (
      <ImageViewer
        index={currentIndex}
        imageUrls={imageUrls}
        pageAnimateTime={250}
        enableSwipeDown
        useNativeDriver
        swipeDownThreshold={100}
        renderIndicator={() => <></>}
        saveToLocalByLongPress={false}
        onSwipeDown={() => navigation.goBack()}
        style={{ flex: 1 }}
        onChange={index => index !== undefined && setCurrentIndex(index)}
        renderImage={renderImage}
      />
    )
  },
  () => true
)

const styles = StyleSheet.create({
  headerCenter: {
    color: 'white',
    ...StyleConstants.FontStyle.M
  }
})

export default ScreenImagesViewer
