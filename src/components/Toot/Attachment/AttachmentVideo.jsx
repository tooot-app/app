import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import propTypesAttachment from 'src/prop-types/attachment'
import { Pressable, View } from 'react-native'
import { Video } from 'expo-av'
import { Feather } from '@expo/vector-icons'

export default function AttachmentVideo ({
  media_attachments,
  sensitive,
  width
}) {
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
        source={{ uri: video.remote_url }}
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

AttachmentVideo.propTypes = {
  media_attachments: PropTypes.arrayOf(propTypesAttachment),
  sensitive: PropTypes.bool.isRequired,
  width: PropTypes.number.isRequired
}
