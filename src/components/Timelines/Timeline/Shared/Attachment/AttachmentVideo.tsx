import React, { useCallback, useRef, useState } from 'react'
import { View } from 'react-native'
import { Video } from 'expo-av'
import { ButtonRound } from 'src/components/Button'

export interface Props {
  media_attachments: Mastodon.AttachmentVideo[]
  width: number
}

const AttachmentVideo: React.FC<Props> = ({ media_attachments, width }) => {
  const videoPlayer = useRef<Video>(null)
  const [videoPlay, setVideoPlay] = useState(false)

  const video = media_attachments[0]
  const videoWidth = width
  const videoHeight =
    video.meta?.original?.width && video.meta?.original?.height
      ? (width / video.meta.original.width) * video.meta.original.height
      : (width / 16) * 9

  const playOnPress = useCallback(() => {
    // @ts-ignore
    videoPlayer.current.presentFullscreenPlayer()
    setVideoPlay(true)
  }, [])

  return (
    <View
      style={{
        width: videoWidth,
        height: videoHeight
      }}
    >
      <Video
        ref={videoPlayer}
        source={{ uri: video.remote_url || video.url }}
        style={{
          width: videoWidth,
          height: videoHeight
        }}
        resizeMode='cover'
        usePoster
        posterSource={{ uri: video.preview_url }}
        useNativeControls
        shouldPlay={videoPlay}
      />
      {videoPlayer.current && !videoPlay && (
        <ButtonRound
          icon='play'
          size='L'
          onPress={playOnPress}
          styles={{ top: videoHeight / 2, left: videoWidth / 2 }}
          coordinate='center'
        />
      )}
    </View>
  )
}

export default AttachmentVideo
