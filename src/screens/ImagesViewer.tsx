import analytics from '@components/analytics'
import { HeaderCenter, HeaderLeft, HeaderRight } from '@components/Header'
import { Message } from '@components/Message'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import {
  RootStackParamList,
  RootStackScreenProps
} from '@utils/navigation/navigators'
import { useTheme } from '@utils/styles/ThemeManager'
import { findIndex } from 'lodash'
import React, { RefObject, useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Share, StatusBar, View } from 'react-native'
import FlashMessage from 'react-native-flash-message'
import {
  SafeAreaProvider,
  useSafeAreaInsets
} from 'react-native-safe-area-context'
import ImageViewer from './ImageViewer/Root'
import saveImage from './ImageViewer/save'

const HeaderComponent = React.memo(
  ({
    messageRef,
    navigation,
    currentIndex,
    imageUrls
  }: {
    messageRef: RefObject<FlashMessage>
    navigation: NativeStackNavigationProp<
      RootStackParamList,
      'Screen-ImagesViewer'
    >
    currentIndex: number
    imageUrls: RootStackParamList['Screen-ImagesViewer']['imageUrls']
  }) => {
    const insets = useSafeAreaInsets()
    const { mode } = useTheme()
    const { t } = useTranslation('screenImageViewer')
    const { showActionSheetWithOptions } = useActionSheet()

    const onPress = useCallback(() => {
      analytics('imageviewer_more_press')
      showActionSheetWithOptions(
        {
          options: [
            t('content.options.save'),
            t('content.options.share'),
            t('content.options.cancel')
          ],
          cancelButtonIndex: 2
        },
        async buttonIndex => {
          switch (buttonIndex) {
            case 0:
              analytics('imageviewer_more_save_press')
              saveImage({ messageRef, mode, image: imageUrls[currentIndex] })
              break
            case 1:
              analytics('imageviewer_more_share_press')
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

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: insets.top
        }}
      >
        <HeaderLeft
          content='X'
          native={false}
          background
          onPress={() => navigation.goBack()}
        />
        <HeaderCenter
          inverted
          content={`${currentIndex + 1} / ${imageUrls.length}`}
        />
        <HeaderRight
          accessibilityLabel={t('content.actions.accessibilityLabel')}
          accessibilityHint={t('content.actions.accessibilityHint')}
          content='MoreHorizontal'
          native={false}
          background
          onPress={onPress}
        />
      </View>
    )
  },
  (prev, next) => prev.currentIndex === next.currentIndex
)

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

  const { mode } = useTheme()

  const initialIndex = findIndex(imageUrls, ['id', id])
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const messageRef = useRef<FlashMessage>(null)

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor='rgb(0,0,0)' />
      <ImageViewer
        images={imageUrls}
        imageIndex={initialIndex}
        onImageIndexChange={index => setCurrentIndex(index)}
        onRequestClose={() => navigation.goBack()}
        onLongPress={image => saveImage({ messageRef, mode, image })}
        HeaderComponent={() => (
          <HeaderComponent
            messageRef={messageRef}
            navigation={navigation}
            currentIndex={currentIndex}
            imageUrls={imageUrls}
          />
        )}
      />
      <Message ref={messageRef} />
    </SafeAreaProvider>
  )
}

export default ScreenImagesViewer
