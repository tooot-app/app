import { HeaderLeft, HeaderRight } from '@components/Header'
import { StyleConstants } from '@utils/styles/constants'
import { findIndex } from 'lodash'
import React, { useCallback, useState } from 'react'
import { Image, Platform, Share, StatusBar, StyleSheet, Text } from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { SharedImagesViewerProp } from './sharedScreens'

const Stack = createNativeStackNavigator()

const ScreenSharedImagesViewer: React.FC<SharedImagesViewerProp> = ({
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
      <>
        <StatusBar barStyle='light-content' />
        <ImageViewer
          index={initialIndex}
          imageUrls={imageUrls}
          pageAnimateTime={250}
          enableSwipeDown
          useNativeDriver
          swipeDownThreshold={100}
          renderIndicator={() => <></>}
          saveToLocalByLongPress={false}
          onSwipeDown={() => navigation.goBack()}
          style={{ flex: 1, marginBottom: 44 + safeAreaInsets.bottom }}
          onChange={index => index !== undefined && setCurrentIndex(index)}
          renderImage={prop => {
            return <Image {...prop} resizeMode={'contain'} />
          }}
        />
      </>
    ),
    []
  )

  const onPress = useCallback(() => {
    switch (Platform.OS) {
      case 'ios':
        return Share.share({ url: imageUrls[currentIndex].url })
      case 'android':
        return Share.share({ message: imageUrls[currentIndex].url })
    }
  }, [currentIndex])

  return (
    <Stack.Navigator
      screenOptions={{ headerHideShadow: true, headerTopInsetEnabled: false }}
    >
      <Stack.Screen
        name='Screen-Shared-ImagesViewer-Root'
        component={component}
        options={{
          contentStyle: { backgroundColor: 'black' },
          headerStyle: { backgroundColor: 'black' },
          headerLeft: () => (
            <HeaderLeft content='X' onPress={() => navigation.goBack()} />
          ),
          headerCenter: () => (
            <Text style={styles.headerCenter}>
              {currentIndex + 1} / {imageUrls.length}
            </Text>
          ),
          headerRight: () => <HeaderRight content='Share' onPress={onPress} />
        }}
      />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  headerCenter: {
    color: 'white',
    ...StyleConstants.FontStyle.M
  }
})

export default React.memo(ScreenSharedImagesViewer, () => true)
