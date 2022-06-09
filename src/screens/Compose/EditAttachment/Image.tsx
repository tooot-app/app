import CustomText from '@components/Text'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Image, View } from 'react-native'
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
}

const ComposeEditAttachmentImage: React.FC<Props> = ({ index }) => {
  const { t } = useTranslation('screenCompose')
  const { colors } = useTheme()
  const { screenReaderEnabled } = useAccessibility()

  const { composeState, composeDispatch } = useContext(ComposeContext)
  const theAttachmentRemote = composeState.attachments.uploads[index].remote!
  const theAttachmentLocal = composeState.attachments.uploads[index].local

  const imageWidthBase =
    theAttachmentRemote?.meta?.original?.aspect < 1
      ? Dimensions.get('screen').width *
        theAttachmentRemote?.meta?.original?.aspect
      : Dimensions.get('screen').width
  const padding = (Dimensions.get('screen').width - imageWidthBase) / 2
  const imageDimensionis = {
    width: imageWidthBase,
    height:
      imageWidthBase /
      ((theAttachmentRemote as Mastodon.AttachmentImage)?.meta?.original
        ?.aspect || 1)
  }

  const panX = useSharedValue(
    (((theAttachmentRemote as Mastodon.AttachmentImage)?.meta?.focus?.x || 0) *
      imageDimensionis.width) /
      2
  )
  const panY = useSharedValue(
    (((theAttachmentRemote as Mastodon.AttachmentImage)?.meta?.focus?.y || 0) *
      imageDimensionis.height) /
      2
  )
  const updateFocus = ({ x, y }: { x: number; y: number }) => {
    composeDispatch({
      type: 'attachment/edit',
      payload: {
        ...theAttachmentRemote,
        meta: {
          ...theAttachmentRemote.meta,
          focus: {
            x: x > 1 ? 1 : x,
            y: y > 1 ? 1 : y
          }
        }
      }
    })
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
            uri: theAttachmentLocal?.uri
              ? theAttachmentLocal.uri
              : theAttachmentRemote?.preview_url
          }}
        />
        <PanGestureHandler onGestureEvent={onGestureEvent}>
          <Animated.View
            style={[
              styleTransform,
              {
                position: 'absolute',
                top: -500 + imageDimensionis.height / 2,
                left: -500 + imageDimensionis.width / 2
              }
            ]}
          >
            <Svg width='1000' height='1000' viewBox='0 0 1000 1000'>
              <G stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'>
                <G>
                  <Path
                    d='M1000,0 L1000,1000 L0,1000 L0,0 L1000,0 Z M500,475 C486.192881,475 475,486.192881 475,500 C475,513.807119 486.192881,525 500,525 C513.807119,525 525,513.807119 525,500 C525,486.192881 513.807119,475 500,475 Z'
                    fill={colors.backgroundOverlayInvert}
                  />
                  <Circle
                    stroke={colors.primaryOverlay}
                    stroke-width='2'
                    cx='500'
                    cy='500'
                    r='24'
                  />
                  <Circle
                    fill={colors.primaryOverlay}
                    cx='500'
                    cy='500'
                    r='2'
                  />
                </G>
              </G>
            </Svg>
          </Animated.View>
        </PanGestureHandler>
      </View>
      {screenReaderEnabled ? null : (
        <CustomText
          fontStyle='M'
          style={{
            padding: StyleConstants.Spacing.Global.PagePadding,
            color: colors.primaryDefault
          }}
        >
          {t('content.editAttachment.content.imageFocus')}
        </CustomText>
      )}
    </>
  )
}

export default ComposeEditAttachmentImage
