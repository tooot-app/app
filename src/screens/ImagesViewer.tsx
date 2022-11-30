import GracefullyImage from '@components/GracefullyImage'
import { HeaderCenter, HeaderLeft, HeaderRight } from '@components/Header'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { RootStackScreenProps } from '@utils/navigation/navigators'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dimensions,
  FlatList,
  PixelRatio,
  Platform,
  Share,
  StatusBar,
  View,
  ViewToken
} from 'react-native'
import { Directions, Gesture, LongPressGestureHandler } from 'react-native-gesture-handler'
import { LiveTextImageView } from 'react-native-live-text-image-view'
import { runOnJS, useSharedValue } from 'react-native-reanimated'
import { Zoom, createZoomListComponent } from 'react-native-reanimated-zoom'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import saveImage from './ImageViewer/save'

const ZoomFlatList = createZoomListComponent(FlatList)

const ScreenImagesViewer = ({
  route: {
    params: { imageUrls, id }
  },
  navigation
}: RootStackScreenProps<'Screen-ImagesViewer'>) => {
  if (imageUrls.length === 0) {
    navigation.goBack()
    return null
  }

  const SCREEN_WIDTH = Dimensions.get('screen').width
  const SCREEN_HEIGHT = Dimensions.get('screen').height

  const insets = useSafeAreaInsets()

  const { mode, theme } = useTheme()
  const { t } = useTranslation('screenImageViewer')

  const initialIndex = imageUrls.findIndex(image => image.id === id)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const { showActionSheetWithOptions } = useActionSheet()
  const onPress = useCallback(() => {
    showActionSheetWithOptions(
      {
        options: [
          t('content.options.save'),
          t('content.options.share'),
          t('common:buttons.cancel')
        ],
        cancelButtonIndex: 2,
        userInterfaceStyle: mode
      },
      async buttonIndex => {
        switch (buttonIndex) {
          case 0:
            saveImage({ theme, image: imageUrls[currentIndex] })
            break
          case 1:
            switch (Platform.OS) {
              case 'ios':
                await Share.share({ url: imageUrls[currentIndex].url })
                break
              case 'android':
                await Share.share({ message: imageUrls[currentIndex].url })
                break
            }
            break
        }
      }
    )
  }, [currentIndex])

  const isZoomed = useSharedValue(false)

  const renderItem = React.useCallback(
    ({
      item
    }: {
      item: RootStackScreenProps<'Screen-ImagesViewer'>['route']['params']['imageUrls'][0]
    }) => {
      const screenRatio = SCREEN_WIDTH / SCREEN_HEIGHT
      const imageRatio = item.width && item.height ? item.width / item.height : 1
      const imageWidth = item.width || 100
      const imageHeight = item.height || 100

      const maxWidthScale = item.width ? (item.width / SCREEN_WIDTH / PixelRatio.get()) * 4 : 0
      const maxHeightScale = item.height ? (item.height / SCREEN_WIDTH / PixelRatio.get()) * 4 : 0
      const max = Math.max.apply(Math, [maxWidthScale, maxHeightScale, 4])

      return (
        <Zoom
          onZoomBegin={() => (isZoomed.value = true)}
          onZoomEnd={() => (isZoomed.value = false)}
          maximumZoomScale={max > 8 ? 8 : max}
          simultaneousGesture={Gesture.Fling()
            .direction(Directions.DOWN)
            .onStart(() => {
              if (isZoomed.value === false) {
                runOnJS(navigation.goBack)()
              }
            })}
          children={
            <View
              style={{
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LiveTextImageView>
                <GracefullyImage
                  uri={{ preview: item.preview_url, remote: item.remote_url, original: item.url }}
                  blurhash={item.blurhash}
                  dimension={{
                    width:
                      screenRatio > imageRatio
                        ? (SCREEN_HEIGHT / imageHeight) * imageWidth
                        : SCREEN_WIDTH,
                    height:
                      screenRatio > imageRatio
                        ? SCREEN_HEIGHT
                        : (SCREEN_WIDTH / imageWidth) * imageHeight
                  }}
                />
              </LiveTextImageView>
            </View>
          }
        />
      )
    },
    [isZoomed.value]
  )

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      setCurrentIndex(viewableItems[0]?.index || 0)
    },
    []
  )

  return (
    <View style={{ backgroundColor: 'black' }}>
      <StatusBar hidden />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: insets.top,
          position: 'absolute',
          width: '100%',
          zIndex: 999
        }}
      >
        <HeaderLeft content='X' native={false} background onPress={() => navigation.goBack()} />
        <HeaderCenter inverted content={`${currentIndex + 1} / ${imageUrls.length}`} />
        <HeaderRight
          accessibilityLabel={t('content.actions.accessibilityLabel')}
          accessibilityHint={t('content.actions.accessibilityHint')}
          content='MoreHorizontal'
          native={false}
          background
          onPress={onPress}
        />
      </View>
      <LongPressGestureHandler
        onEnded={() => {
          showActionSheetWithOptions(
            {
              options: [
                t('content.options.save'),
                t('content.options.share'),
                t('content.options.cancel')
              ],
              cancelButtonIndex: 2,
              userInterfaceStyle: mode
            },
            async buttonIndex => {
              switch (buttonIndex) {
                case 0:
                  saveImage({ theme, image: imageUrls[currentIndex] })
                  break
                case 1:
                  switch (Platform.OS) {
                    case 'ios':
                      await Share.share({ url: imageUrls[currentIndex].url })
                      break
                    case 'android':
                      await Share.share({
                        message: imageUrls[currentIndex].url
                      })
                      break
                  }
                  break
              }
            }
          )
        }}
      >
        <ZoomFlatList
          data={imageUrls}
          pagingEnabled
          horizontal
          keyExtractor={item => item.id}
          renderItem={renderItem}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50
          }}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index
          })}
        />
      </LongPressGestureHandler>
    </View>
  )
}

export default ScreenImagesViewer
