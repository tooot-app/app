import React, { useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import { Video } from 'expo-av'
import { Feather } from '@expo/vector-icons'

export interface Props {
  media_attachments: mastodon.Attachment[]
  sensitive: boolean
  width: number
}

const AttachmentVideo: React.FC<Props> = ({
  media_attachments,
  sensitive,
  width
}) => {
  const videoPlayer = useRef()
  const [mediaSensitive, setMediaSensitive] = useState(sensitive)
  const [videoPlay, setVideoPlay] = useState(false)

  const video = media_attachments[0]
  const videoWidth = width
  const videoHeight =
    (width / video.meta.original.width) * video.meta.original.height

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
        posterSourceThe={{ uri: video.preview_url }}
        useNativeControls
        shouldPlay={videoPlay}
      />
      {!videoPlay && (
        <Pressable
          onPress={() => {
            setMediaSensitive(false)
            videoPlayer.current.presentFullscreenPlayer()
            setVideoPlay(true)
          }}
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
