import Button from '@components/Button'
import { StyleConstants } from '@utils/styles/constants'
import { ResizeMode, Video, VideoFullscreenUpdate } from 'expo-av'
import React, { useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import { Blurhash } from 'react-native-blurhash'
import AttachmentAltText from './AltText'
import { Platform } from 'expo-modules-core'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { aspectRatio } from './dimensions'

export interface Props {
  total: number
  index: number
  sensitiveShown: boolean
  video: Mastodon.AttachmentVideo | Mastodon.AttachmentGifv
  gifv?: boolean
}

const AttachmentVideo: React.FC<Props> = ({
  total,
  index,
  sensitiveShown,
  video,
  gifv = false
}) => {
  const { reduceMotionEnabled } = useAccessibility()

  const videoPlayer = useRef<Video>(null)
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoResizeMode, setVideoResizeMode] = useState<ResizeMode>(ResizeMode.COVER)
  const playOnPress = async () => {
    setVideoLoading(true)
    if (!videoLoaded) {
      await videoPlayer.current?.loadAsync({ uri: video.url })
    }
    setVideoLoading(false)

    Platform.OS === 'android' && setVideoResizeMode(ResizeMode.CONTAIN)
    await videoPlayer.current?.presentFullscreenPlayer()

    videoPlayer.current?.playAsync()
  }

  return (
    <View
      style={{
        flex: 1,
        flexBasis: '50%',
        padding: StyleConstants.Spacing.XS / 2,
        aspectRatio: aspectRatio({ total, index, ...video.meta?.original })
      }}
    >
      <Video
        accessibilityLabel={video.description}
        ref={videoPlayer}
        style={{ width: '100%', height: '100%', opacity: sensitiveShown ? 0 : 1 }}
        usePoster
        resizeMode={videoResizeMode}
        {...(gifv
          ? {
              shouldPlay: reduceMotionEnabled ? false : true,
              isMuted: true,
              isLooping: true,
              source: { uri: video.url }
            }
          : {
              posterSource: { uri: video.preview_url },
              posterStyle: { resizeMode: ResizeMode.COVER }
            })}
        useNativeControls={false}
        onFullscreenUpdate={event => {
          if (event.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_DISMISS) {
            Platform.OS === 'android' && setVideoResizeMode(ResizeMode.COVER)
            if (gifv && !reduceMotionEnabled) {
              videoPlayer.current?.playAsync()
            } else {
              videoPlayer.current?.pauseAsync()
            }
          }
        }}
        onPlaybackStatusUpdate={event => {
          if (event.isLoaded) {
            !videoLoaded && setVideoLoaded(true)

            if (event.didJustFinish) {
              videoPlayer.current?.setPositionAsync(0)
            }
          }
        }}
      />
      <Pressable
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}
        disabled={gifv ? (sensitiveShown ? true : false) : true}
        onPress={gifv ? playOnPress : null}
      >
        {sensitiveShown ? (
          video.blurhash ? (
            <Blurhash blurhash={video.blurhash} style={{ width: '100%', height: '100%' }} />
          ) : null
        ) : !gifv || (gifv && reduceMotionEnabled) ? (
          <Button
            round
            overlay
            size='L'
            type='icon'
            content='PlayCircle'
            onPress={playOnPress}
            loading={videoLoading}
          />
        ) : null}
        <AttachmentAltText sensitiveShown={sensitiveShown} text={video.description} />
      </Pressable>
    </View>
  )
}

export default AttachmentVideo
