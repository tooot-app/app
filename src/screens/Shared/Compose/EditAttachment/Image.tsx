import { StyleConstants } from '@root/utils/styles/constants'
import { useTheme } from '@root/utils/styles/ThemeManager'
import { ComposeContext } from '@screens/Shared/Compose'
import React, { MutableRefObject, useCallback, useContext, useRef } from 'react'
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { PanGestureHandler } from 'react-native-gesture-handler'
import Svg, { Circle, G, Path } from 'react-native-svg'

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

  const imageDimensionis = {
    width: Dimensions.get('screen').width,
    height:
      Dimensions.get('screen').width /
      (theAttachmentRemote as Mastodon.AttachmentImage).meta?.original?.aspect!
  }

  const panFocus = useRef(
    new Animated.ValueXY(
      (theAttachmentRemote as Mastodon.AttachmentImage).meta?.focus?.x &&
      (theAttachmentRemote as Mastodon.AttachmentImage).meta?.focus?.y
        ? {
            x:
              ((theAttachmentRemote as Mastodon.AttachmentImage).meta!.focus!
                .x *
                imageDimensionis.width) /
              2,
            y:
              (-(theAttachmentRemote as Mastodon.AttachmentImage).meta!.focus!
                .y *
                imageDimensionis.height) /
              2
          }
        : { x: 0, y: 0 }
    )
  ).current
  const panX = panFocus.x.interpolate({
    inputRange: [-imageDimensionis.width / 2, imageDimensionis.width / 2],
    outputRange: [-imageDimensionis.width / 2, imageDimensionis.width / 2],
    extrapolate: 'clamp'
  })
  const panY = panFocus.y.interpolate({
    inputRange: [-imageDimensionis.height / 2, imageDimensionis.height / 2],
    outputRange: [-imageDimensionis.height / 2, imageDimensionis.height / 2],
    extrapolate: 'clamp'
  })
  panFocus.addListener(e => {
    focus.current = {
      x: e.x / (imageDimensionis.width / 2),
      y: -e.y / (imageDimensionis.height / 2)
    }
  })
  const handleGesture = Animated.event(
    [{ nativeEvent: { translationX: panFocus.x, translationY: panFocus.y } }],
    { useNativeDriver: true }
  )
  const onHandlerStateChange = useCallback(() => {
    panFocus.extractOffset()
  }, [])

  return (
    <>
      <View style={{ overflow: 'hidden' }}>
        <Image
          style={{
            width: imageDimensionis.width,
            height: imageDimensionis.height
          }}
          source={{
            uri: theAttachmentLocal.uri || theAttachmentRemote.preview_url
          }}
        />
        <PanGestureHandler
          onGestureEvent={handleGesture}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: -1000 + imageDimensionis.height / 2,
                left: -1000 + imageDimensionis.width / 2,
                transform: [{ translateX: panX }, { translateY: panY }]
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
                      stroke={theme.background}
                      strokeWidth='2'
                      cx='33'
                      cy='33'
                      r='33'
                    />
                    <Circle fill={theme.background} cx='33' cy='33' r='2' />
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
