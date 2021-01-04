import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { MutableRefObject, useContext } from 'react'
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native'
import { PanGestureHandler } from 'react-native-gesture-handler'
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated'
import Svg, { Circle, G, Path } from 'react-native-svg'
import ComposeContext from '../utils/createContext'

export interface Props {
  index: number
  focus: MutableRefObject<{
    x: number
    y: number
  }>
}

const ComposeEditAttachmentImage: React.FC<Props> = ({ index, focus }) => {
  const { theme } = useTheme()

  const { composeState } = useContext(ComposeContext)
  const theAttachmentRemote = composeState.attachments.uploads[index].remote!
  const theAttachmentLocal = composeState.attachments.uploads[index].local!

  const imageWidthBase =
    theAttachmentRemote.meta?.original?.aspect < 1
      ? Dimensions.get('screen').width *
        theAttachmentRemote.meta?.original?.aspect
      : Dimensions.get('screen').width
  const padding = (Dimensions.get('screen').width - imageWidthBase) / 2
  const imageDimensionis = {
    width: imageWidthBase,
    height:
      imageWidthBase /
      (theAttachmentRemote as Mastodon.AttachmentImage).meta?.original?.aspect!
  }

  const panX = useSharedValue(
    (((theAttachmentRemote as Mastodon.AttachmentImage).meta?.focus?.x || 0) *
      imageDimensionis.width) /
      2
  )
  const panY = useSharedValue(
    (((theAttachmentRemote as Mastodon.AttachmentImage).meta?.focus?.y || 0) *
      imageDimensionis.height) /
      2
  )
  const updateFocus = ({ x, y }: { x: number; y: number }) => {
    focus.current = { x, y }
  }
  type PanContext = {
    startX: number
    startY: number
  }
  const onGestureEvent = useAnimatedGestureHandler({
    onStart: (_, context: PanContext) => {
      context.startX = panX.value
      context.startY = panY.value
    },
    onActive: ({ translationX, translationY }, context: PanContext) => {
      panX.value = context.startX + translationX
      panY.value = context.startY + translationY
    },
    onEnd: ({ translationX, translationY }, context: PanContext) => {
      runOnJS(updateFocus)({
        x: (context.startX + translationX) / (imageDimensionis.width / 2),
        y: (context.startY + translationY) / (imageDimensionis.height / 2)
      })
    }
  })
  const styleTransform = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            panX.value,
            [
              -imageDimensionis.width / 2 + padding,
              imageDimensionis.width / 2 + padding
            ],
            [
              -imageDimensionis.width / 2 + padding,
              imageDimensionis.width / 2 + padding
            ],
            Extrapolate.CLAMP
          )
        },
        {
          translateY: interpolate(
            panY.value,
            [-imageDimensionis.height / 2, imageDimensionis.height / 2],
            [-imageDimensionis.height / 2, imageDimensionis.height / 2],
            Extrapolate.CLAMP
          )
        }
      ]
    }
  })

  return (
    <>
      <View style={{ overflow: 'hidden', flex: 1, alignItems: 'center' }}>
        <Image
          style={{
            width: imageDimensionis.width,
            height: imageDimensionis.height
          }}
          source={{
            uri: theAttachmentLocal.uri || theAttachmentRemote.preview_url
          }}
        />
        <PanGestureHandler onGestureEvent={onGestureEvent}>
          <Animated.View
            style={[
              styleTransform,
              {
                position: 'absolute',
                top: -1000 + imageDimensionis.height / 2,
                left: -1000 + imageDimensionis.width / 2
              }
            ]}
          >
            <Svg width='2000' height='2000' viewBox='0 0 2000 2000'>
              <G>
                <G id='Mask'>
                  <Path
                    d={
                      'M2000,0 L2000,2000 L0,2000 L0,0 L2000,0 Z M1000,967 C981.774603,967 967,981.774603 967,1000 C967,1018.2254 981.774603,1033 1000,1033 C1018.2254,1033 1033,1018.2254 1033,1000 C1033,981.774603 1018.2254,967 1000,967 Z'
                    }
                    fill={theme.backgroundOverlay}
                  />
                  <G transform='translate(967, 967)'>
                    <Circle
                      stroke={theme.primaryOverlay}
                      strokeWidth='2'
                      cx='33'
                      cy='33'
                      r='33'
                    />
                    <Circle fill={theme.primaryOverlay} cx='33' cy='33' r='2' />
                  </G>
                </G>
              </G>
            </Svg>
          </Animated.View>
        </PanGestureHandler>
      </View>
      <Text style={[styles.imageFocusText, { color: theme.primary }]}>
        在预览图上拖动圆圈，以选择缩略图的焦点。
      </Text>
    </>
  )
}

const styles = StyleSheet.create({
  imageFocusText: {
    ...StyleConstants.FontStyle.M,
    padding: StyleConstants.Spacing.Global.PagePadding
  }
})

export default ComposeEditAttachmentImage
