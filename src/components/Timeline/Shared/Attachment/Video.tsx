import Button from '@components/Button'
import GracefullyImage from '@components/GracefullyImage'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { connectMedia } from '@utils/api/helpers/connect'
import { useGlobalStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { ResizeMode, Video, VideoFullscreenUpdate } from 'expo-av'
import { Platform } from 'expo-modules-core'
import * as ScreenOrientation from 'expo-screen-orientation'
import React, { useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import AttachmentAltText from './AltText'
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
  const { colors } = useTheme()
  const { reduceMotionEnabled } = useAccessibility()
  const [shouldAutoplayGifv] = useGlobalStorage.boolean('app.auto_play_gifv')

  const videoPlayer = useRef<Video>(null)
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoResizeMode, setVideoResizeMode] = useState<ResizeMode>(ResizeMode.COVER)
  const playOnPress = async () => {
    setVideoLoading(true)
    if (!videoLoaded) {
      await videoPlayer.current?.loadAsync(connectMedia({ uri: video.url }) as { uri: string })
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
        backgroundColor: colors.shimmerDefault,
        aspectRatio: aspectRatio({ total, index, ...video.meta?.original }),
        alignContent: 'center',
        justifyContent: 'center',
        borderRadius: StyleConstants.BorderRadius / 2,
        overflow: 'hidden'
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
              shouldPlay: reduceMotionEnabled || !shouldAutoplayGifv ? false : true,
              isMuted: true,
              isLooping: true,
              source: connectMedia({ uri: video.url }) as { uri: string }
            }
          : {
              posterSource: connectMedia({ uri: video.preview_url }),
              posterStyle: { resizeMode: ResizeMode.COVER }
            })}
        useNativeControls={false}
        onFullscreenUpdate={async ({ fullscreenUpdate }) => {
          switch (fullscreenUpdate) {
            case VideoFullscreenUpdate.PLAYER_DID_PRESENT:
              Platform.OS === 'android' && (await ScreenOrientation.unlockAsync())
              break
            case VideoFullscreenUpdate.PLAYER_WILL_DISMISS:
              Platform.OS === 'android' &&
                (await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT))
              Platform.OS === 'android' && setVideoResizeMode(ResizeMode.COVER)
              if (gifv && !reduceMotionEnabled && shouldAutoplayGifv) {
                videoPlayer.current?.playAsync()
              } else {
                videoPlayer.current?.pauseAsync()
              }
              break
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
            <GracefullyImage
              sources={{ blurhash: video.blurhash }}
              style={{ width: '100%', height: '100%' }}
            />
          ) : null
        ) : !gifv || (gifv && (reduceMotionEnabled || !shouldAutoplayGifv)) ? (
          <Button
            round
            overlay
            size='L'
            type='icon'
            content='play-circle'
            onPress={playOnPress}
            loading={videoLoading}
          />
        ) : null}
        <AttachmentAltText sensitiveShown={sensitiveShown} text={video.description} />
      </Pressable>
      {gifv && !shouldAutoplayGifv ? (
        <Button
          style={{
            position: 'absolute',
            left: StyleConstants.Spacing.S,
            bottom: StyleConstants.Spacing.S
          }}
          overlay
          size='S'
          type='text'
          content='GIF'
          fontBold
          onPress={() => {}}
        />
      ) : null}
    </View>
  )
}

export default AttachmentVideo
