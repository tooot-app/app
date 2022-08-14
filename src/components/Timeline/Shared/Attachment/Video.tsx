import Button from '@components/Button'
import { StyleConstants } from '@utils/styles/constants'
import { ResizeMode, Video, VideoFullscreenUpdate } from 'expo-av'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus, Pressable, View } from 'react-native'
import { Blurhash } from 'react-native-blurhash'
import attachmentAspectRatio from './aspectRatio'
import analytics from '@components/analytics'
import AttachmentAltText from './AltText'

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
  const videoPlayer = useRef<Video>(null)
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoPosition, setVideoPosition] = useState<number>(0)
  const playOnPress = useCallback(async () => {
    analytics('timeline_shared_attachment_video_length', {
      length: video.meta?.length
    })
    analytics('timeline_shared_attachment_vide_play_press', {
      id: video.id,
      timestamp: Date.now()
    })
    setVideoLoading(true)
    if (!videoLoaded) {
      await videoPlayer.current?.loadAsync({ uri: video.url })
    }
    await videoPlayer.current?.setPositionAsync(videoPosition)
    await videoPlayer.current?.presentFullscreenPlayer()
    videoPlayer.current?.playAsync()
    setVideoLoading(false)
    videoPlayer.current?.setOnPlaybackStatusUpdate(props => {
      if (props.isLoaded) {
        setVideoLoaded(true)
        if (props.positionMillis) {
          setVideoPosition(props.positionMillis)
        }
      }
    })
  }, [videoLoaded, videoPosition])

  const appState = useRef(AppState.currentState)
  useEffect(() => {
    const appState = AppState.addEventListener('change', _handleAppStateChange)

    return () => appState.remove()
  }, [])
  const _handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/active/) && nextAppState.match(/inactive/)) {
      await videoPlayer.current?.pauseAsync()
    } else if (
      gifv &&
      appState.current.match(/background/) &&
      nextAppState.match(/active/)
    ) {
      await videoPlayer.current?.setIsMutedAsync(true)
      await videoPlayer.current?.playAsync()
    }

    appState.current = nextAppState
  }

  const playerStatus = useRef<any>(null)
  useEffect(() => {
    videoPlayer.current?.setOnPlaybackStatusUpdate(playbackStatus => {
      playerStatus.current = playbackStatus
    })
  }, [])

  return (
    <View
      style={{
        flex: 1,
        flexBasis: '50%',
        padding: StyleConstants.Spacing.XS / 2,
        aspectRatio: attachmentAspectRatio({ total, index })
      }}
    >
      <Video
        accessibilityLabel={video.description}
        ref={videoPlayer}
        style={{
          width: '100%',
          height: '100%',
          opacity: sensitiveShown ? 0 : 1
        }}
        usePoster
        resizeMode={ResizeMode.COVER}
        {...(gifv
          ? {
              shouldPlay: true,
              isMuted: true,
              isLooping: true,
              source: { uri: video.url }
            }
          : {
              posterSource: { uri: video.preview_url },
              posterStyle: { resizeMode: ResizeMode.COVER }
            })}
        useNativeControls={false}
        onFullscreenUpdate={async event => {
          if (
            event.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_DID_DISMISS
          ) {
            if (gifv) {
              await videoPlayer.current?.pauseAsync()
            } else {
              await videoPlayer.current?.pauseAsync()
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
        onPress={gifv ? playOnPress : null}
      >
        {sensitiveShown ? (
          video.blurhash ? (
            <Blurhash
              blurhash={video.blurhash}
              style={{
                width: '100%',
                height: '100%'
              }}
            />
          ) : null
        ) : !gifv || (gifv && playerStatus.current === false) ? (
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
        <AttachmentAltText
          sensitiveShown={sensitiveShown}
          text={video.description}
        />
      </Pressable>
    </View>
  )
}

export default AttachmentVideo
