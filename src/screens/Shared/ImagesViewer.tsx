import { HeaderLeft, HeaderRight } from '@root/components/Header'
import { StyleConstants } from '@root/utils/styles/constants'
import { findIndex } from 'lodash'
import React, { useCallback, useState } from 'react'
import { ActionSheetIOS, Image, StyleSheet, Text } from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer'
import { IImageInfo } from 'react-native-image-zoom-viewer/built/image-viewer.type'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'

const Stack = createNativeStackNavigator()

export interface Props {
  route: {
    params: {
      imageUrls: (IImageInfo & {
        preview_url: Mastodon.AttachmentImage['preview_url']
        remote_url: Mastodon.AttachmentImage['remote_url']
        imageIndex: number
      })[]
      imageIndex: number
    }
  }
}

const TheImage = ({
  style,
  source,
  imageUrls,
  imageIndex
}: {
  style: any
  source: { uri: string }
  imageUrls: (IImageInfo & {
    preview_url: Mastodon.AttachmentImage['preview_url']
    remote_url: Mastodon.AttachmentImage['remote_url']
    imageIndex: number
  })[]
  imageIndex: number
}) => {
  const [imageVisible, setImageVisible] = useState(false)
  Image.getSize(source.uri, () => setImageVisible(true))
  return (
    <Image
      style={style}
      source={{
        uri: imageVisible
          ? source.uri
          : imageUrls[findIndex(imageUrls, ['imageIndex', imageIndex])]
              .preview_url
      }}
    />
  )
}

const ScreenSharedImagesViewer: React.FC<Props> = ({
  route: {
    params: { imageUrls, imageIndex }
  },
  navigation
}) => {
  const safeAreaInsets = useSafeAreaInsets()

  const initialIndex = findIndex(imageUrls, ['imageIndex', imageIndex])
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const component = useCallback(
    () => (
      <ImageViewer
        style={{ flex: 1, marginBottom: 44 + safeAreaInsets.bottom }}
        imageUrls={imageUrls}
        index={initialIndex}
        onSwipeDown={() => navigation.goBack()}
        enableSwipeDown={true}
        swipeDownThreshold={100}
        useNativeDriver={true}
        saveToLocalByLongPress={false}
        renderIndicator={() => <></>}
        onChange={index => index !== undefined && setCurrentIndex(index)}
        renderImage={props => (
          <TheImage {...props} imageUrls={imageUrls} imageIndex={imageIndex} />
        )}
      />
    ),
    []
  )
  return (
    <Stack.Navigator screenOptions={{ headerHideShadow: true }}>
      <Stack.Screen
        name='Screen-Shared-ImagesViewer-Root'
        component={component}
        options={{
          contentStyle: { backgroundColor: 'black' },
          headerStyle: { backgroundColor: 'black' },
          headerLeft: () => (
            <HeaderLeft content='x' onPress={() => navigation.goBack()} />
          ),
          headerCenter: () => (
            <Text style={styles.headerCenter}>
              {currentIndex + 1} / {imageUrls.length}
            </Text>
          ),
          headerRight: () => (
            <HeaderRight
              content='share'
              onPress={() =>
                ActionSheetIOS.showShareActionSheetWithOptions(
                  {
                    url: imageUrls[currentIndex].url
                  },
                  () => null,
                  () => null
                )
              }
            />
          )
        }}
      />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  headerCenter: {
    color: 'white',
    fontSize: StyleConstants.Font.Size.M
  }
})

export default React.memo(ScreenSharedImagesViewer, () => true)
