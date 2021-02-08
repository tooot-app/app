import Button from '@components/Button'
import { StyleConstants } from '@utils/styles/constants'
import { Video } from 'expo-av'
import React, { useCallback, useRef, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Blurhash } from 'react-native-blurhash'
import attachmentAspectRatio from './aspectRatio'
import analytics from '@components/analytics'

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
      }
      // @ts-ignore
      if (props.positionMillis) {
        // @ts-ignore
        setVideoPosition(props.positionMillis)
      }
    })
  }, [videoLoaded, videoPosition])

  return (
    <View
      style={[
        styles.base,
        { aspectRatio: attachmentAspectRatio({ total, index }) }
      ]}
    >
      <Video
        ref={videoPlayer}
        style={{
          width: '100%',
          height: '100%',
          opacity: sensitiveShown ? 0 : 1
        }}
        resizeMode='cover'
        usePoster
        posterSource={{ uri: video.preview_url }}
        posterStyle={{ resizeMode: 'cover' }}
        useNativeControls={false}
        onFullscreenUpdate={event => {
          if (event.fullscreenUpdate === 3) {
            analytics('timeline_shared_attachment_video_pause_press', {
              id: video.id,
              timestamp: Date.now()
            })
            videoPlayer.current?.pauseAsync()
          }
        }}
      />
      <Pressable style={styles.overlay}>
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
        ) : gifv ? null : (
          <Button
            round
            overlay
            size='L'
            type='icon'
            content='PlayCircle'
            onPress={playOnPress}
            loading={videoLoading}
          />
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexBasis: '50%',
    padding: StyleConstants.Spacing.XS / 2
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default AttachmentVideo
