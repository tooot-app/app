import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { connectMedia } from '@utils/api/helpers/connect'
import { useTheme } from '@utils/styles/ThemeManager'
import { Image, ImageSource, ImageStyle } from 'expo-image'
import React, { useState } from 'react'
import { AccessibilityProps, Pressable, StyleProp, View, ViewStyle } from 'react-native'

export interface Props {
  accessibilityLabel?: AccessibilityProps['accessibilityLabel']
  accessibilityHint?: AccessibilityProps['accessibilityHint']

  hidden?: boolean
  sources: {
    preview?: ImageSource
    default?: ImageSource
    remote?: ImageSource
    static?: ImageSource
    blurhash?: string
  }
  dimension?: { width: number; height: number }
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  imageStyle?: ImageStyle
  // For image viewer when there is no image size available
  setImageDimensions?: React.Dispatch<
    React.SetStateAction<{
      width: number
      height: number
    }>
  >
  dim?: boolean
  enableLiveTextInteraction?: boolean
}

const GracefullyImage = ({
  accessibilityLabel,
  accessibilityHint,
  hidden = false,
  sources,
  dimension,
  onPress,
  style,
  imageStyle,
  setImageDimensions,
  dim,
  enableLiveTextInteraction = false
}: Props) => {
  const { reduceMotionEnabled } = useAccessibility()
  const { theme } = useTheme()

  const [currentSource, setCurrentSource] = useState<ImageSource | undefined>(
    sources.default || sources.remote
  )
  const source: ImageSource | undefined =
    reduceMotionEnabled && sources.static ? sources.static : currentSource

  return (
    <Pressable
      {...(onPress ? { accessibilityRole: 'imagebutton' } : { accessibilityRole: 'image' })}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={[style, dimension]}
      {...(onPress ? (hidden ? { disabled: true } : { onPress }) : { disabled: true })}
    >
      <Image
        placeholderContentFit='cover'
        placeholder={sources.blurhash || connectMedia(sources.preview)}
        source={hidden ? undefined : connectMedia(source)}
        transition={{ duration: 80 }}
        style={{ flex: 1, ...imageStyle }}
        onLoad={event => {
          if (setImageDimensions && event.source) {
            setImageDimensions(event.source)
          }
        }}
        onError={() => {
          if (
            sources.default?.uri &&
            sources.default?.uri === currentSource?.uri &&
            sources.remote
          ) {
            setCurrentSource(sources.remote)
          }
        }}
        enableLiveTextInteraction={enableLiveTextInteraction}
      />
      {dim && theme !== 'light' ? (
        <View
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            backgroundColor: 'black',
            opacity: theme === 'dark_lighter' ? 0.18 : 0.36
          }}
        />
      ) : null}
    </Pressable>
  )
}

export default GracefullyImage
