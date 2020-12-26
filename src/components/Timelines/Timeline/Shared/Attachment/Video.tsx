import React, { useCallback, useRef, useState } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { Video } from 'expo-av'
import { ButtonRow } from '@components/Button'
import { Surface } from 'gl-react-expo'
import { Blurhash } from 'gl-react-blurhash'

export interface Props {
  sensitiveShown: boolean
  video: Mastodon.AttachmentVideo | Mastodon.AttachmentGifv
  width: number
  height: number
}

const AttachmentVideo: React.FC<Props> = ({
  sensitiveShown,
  video,
  width,
  height
}) => {
  const videoPlayer = useRef<Video>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoPosition, setVideoPosition] = useState<number>(0)
  const playOnPress = useCallback(async () => {
    if (!videoLoaded) {
      await videoPlayer.current?.loadAsync({ uri: video.url })
    }
    await videoPlayer.current?.setPositionAsync(videoPosition)
    await videoPlayer.current?.presentFullscreenPlayer()
    videoPlayer.current?.playAsync()
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
    <>
      <Video
        ref={videoPlayer}
        style={{
          width,
          height
        }}
        resizeMode='cover'
        usePoster
        posterSource={{ uri: video.preview_url }}
        useNativeControls={false}
      />
      <Pressable style={styles.overlay}>
        {sensitiveShown ? (
          <Surface
            style={{
              width: '100%',
              height: '100%'
            }}
          >
            <Blurhash hash={video.blurhash} />
          </Surface>
        ) : (
          <ButtonRow icon='play' size='L' onPress={playOnPress} />
        )}
      </Pressable>
    </>
  )
}

const styles = StyleSheet.create({
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
