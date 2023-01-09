import GracefullyImage from '@components/GracefullyImage'
import { HeaderCenter, HeaderLeft, HeaderRight } from '@components/Header'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { androidActionSheetStyles } from '@utils/helpers/androidActionSheetStyles'
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
import { runOnJS, useSharedValue } from 'react-native-reanimated'
import { createZoomListComponent, Zoom } from 'react-native-reanimated-zoom'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import saveImage from './save'

const ZoomFlatList = createZoomListComponent(FlatList)

const ScreenImagesViewer = ({
  route: {
    params: { imageUrls, id, hideCounter }
  },
  navigation
}: RootStackScreenProps<'Screen-ImagesViewer'>) => {
  if (imageUrls.length === 0) {
    navigation.goBack()
    return null
  }

  const WINDOW_WIDTH = Dimensions.get('window').width
  const WINDOW_HEIGHT = Dimensions.get('window').height

  const insets = useSafeAreaInsets()

  const { colors } = useTheme()
  const { t } = useTranslation(['common', 'screenImageViewer'])

  const initialIndex = imageUrls.findIndex(image => image.id === id)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const { showActionSheetWithOptions } = useActionSheet()

  const isZoomed = useSharedValue(false)

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
        {!hideCounter ? (
          <HeaderCenter inverted content={`${currentIndex + 1} / ${imageUrls.length}`} />
        ) : null}
        <HeaderRight
          accessibilityLabel={t('screenImageViewer:content.actions.accessibilityLabel')}
          accessibilityHint={t('screenImageViewer:content.actions.accessibilityHint')}
          content='MoreHorizontal'
          native={false}
          background
          onPress={() =>
            showActionSheetWithOptions(
              {
                options: [
                  t('screenImageViewer:content.options.save'),
                  t('screenImageViewer:content.options.share'),
                  t('common:buttons.cancel')
                ],
                cancelButtonIndex: 2,
                ...androidActionSheetStyles(colors)
              },
              async buttonIndex => {
                switch (buttonIndex) {
                  case 0:
                    saveImage({ image: imageUrls[currentIndex] })
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
          }
        />
      </View>
      <LongPressGestureHandler
        onActivated={() => {
          showActionSheetWithOptions(
            {
              options: [
                t('screenImageViewer:content.options.save'),
                t('screenImageViewer:content.options.share'),
                t('common:buttons.cancel')
              ],
              cancelButtonIndex: 2,
              ...androidActionSheetStyles(colors)
            },
            async buttonIndex => {
              switch (buttonIndex) {
                case 0:
                  saveImage({ image: imageUrls[currentIndex] })
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
          renderItem={({
            item
          }: {
            item: RootStackScreenProps<'Screen-ImagesViewer'>['route']['params']['imageUrls'][0]
          }) => {
            const screenRatio = WINDOW_WIDTH / WINDOW_HEIGHT
            const imageRatio = item.width && item.height ? item.width / item.height : 1
            const imageWidth = item.width || 100
            const imageHeight = item.height || 100

            const maxWidthScale = item.width
              ? (item.width / WINDOW_WIDTH / PixelRatio.get()) * 4
              : 0
            const maxHeightScale = item.height
              ? (item.height / WINDOW_WIDTH / PixelRatio.get()) * 4
              : 0
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
                      width: WINDOW_WIDTH,
                      height: WINDOW_HEIGHT,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <GracefullyImage
                      uri={{
                        preview: item.preview_url,
                        remote: item.remote_url,
                        original: item.url
                      }}
                      dimension={{
                        width:
                          screenRatio > imageRatio
                            ? (WINDOW_HEIGHT / imageHeight) * imageWidth
                            : WINDOW_WIDTH,
                        height:
                          screenRatio > imageRatio
                            ? WINDOW_HEIGHT
                            : (WINDOW_WIDTH / imageWidth) * imageHeight
                      }}
                    />
                  </View>
                }
              />
            )
          }}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50
          }}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: WINDOW_WIDTH,
            offset: WINDOW_WIDTH * index,
            index
          })}
        />
      </LongPressGestureHandler>
    </View>
  )
}

export default ScreenImagesViewer
