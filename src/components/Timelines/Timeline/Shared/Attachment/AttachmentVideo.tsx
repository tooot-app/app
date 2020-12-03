import React, { useCallback, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import { Video } from 'expo-av'
import { Feather } from '@expo/vector-icons'

export interface Props {
  media_attachments: Mastodon.Attachment[]
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

  const onPressVideo = useCallback(() => {
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
        <Pressable
          onPress={onPressVideo}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.25)'
          }}
        >
          <Feather name='play' size={36} color='black' />
        </Pressable>
      )}
    </View>
  )
}

export default AttachmentVideo
