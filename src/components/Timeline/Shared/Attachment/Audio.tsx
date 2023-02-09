import Button from '@components/Button'
import GracefullyImage from '@components/GracefullyImage'
import { Slider } from '@sharcoux/slider'
import { connectMedia } from '@utils/api/helpers/connect'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { Audio } from 'expo-av'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus, StyleSheet, View } from 'react-native'
import AttachmentAltText from './AltText'
import { aspectRatio } from './dimensions'

export interface Props {
  total: number
  index: number
  sensitiveShown: boolean
  audio: Mastodon.AttachmentAudio
}

const AttachmentAudio: React.FC<Props> = ({ total, index, sensitiveShown, audio }) => {
  const { colors } = useTheme()

  const [audioPlayer, setAudioPlayer] = useState<Audio.Sound>()
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioPosition, setAudioPosition] = useState(0)
  const playAudio = useCallback(async () => {
    if (!audioPlayer) {
      const { sound } = await Audio.Sound.createAsync(
        connectMedia({ uri: audio.url }) as { uri: string },
        {},
        // @ts-ignore
        props => setAudioPosition(props.positionMillis)
      )
      setAudioPlayer(sound)
    } else {
      await audioPlayer.setPositionAsync(audioPosition)
      audioPlayer.playAsync()
      setAudioPlaying(true)
    }
  }, [audioPlayer, audioPosition])
  const pauseAudio = useCallback(async () => {
    audioPlayer!.pauseAsync()
    setAudioPlaying(false)
  }, [audioPlayer])

  const appState = useRef(AppState.currentState)
  useEffect(() => {
    const appState = AppState.addEventListener('change', _handleAppStateChange)

    return () => appState.remove()
  }, [])
  const _handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/active/) && nextAppState.match(/inactive/)) {
      await audioPlayer?.stopAsync()
    }

    appState.current = nextAppState
  }

  return (
    <View
      accessibilityLabel={audio.description}
      style={[
        styles.base,
        {
          backgroundColor: colors.disabled,
          aspectRatio: aspectRatio({ total, index, ...audio.meta?.original })
        }
      ]}
    >
      <View style={styles.overlay}>
        {sensitiveShown ? (
          audio.blurhash ? (
            <GracefullyImage
              sources={{ blurhash: audio.blurhash }}
              style={{
                width: '100%',
                height: '100%'
              }}
              dim
            />
          ) : null
        ) : (
          <>
            {audio.preview_url ? (
              <GracefullyImage
                sources={{
                  default: { uri: audio.preview_url },
                  remote: { uri: audio.preview_remote_url }
                }}
                style={styles.background}
                dim
              />
            ) : null}
            <Button
              type='icon'
              content={audioPlaying ? 'pause-circle' : 'play-circle'}
              size='L'
              round
              overlay
              {...(audioPlaying ? { onPress: pauseAudio } : { onPress: playAudio })}
            />
          </>
        )}
      </View>
      {audio.meta?.original?.duration ? (
        <View
          style={{
            alignSelf: 'flex-end',
            width: '100%',
            height: StyleConstants.Spacing.M + StyleConstants.Spacing.S * 2,
            backgroundColor: colors.backgroundOverlayInvert,
            paddingHorizontal: StyleConstants.Spacing.Global.PagePadding,
            borderRadius: 100,
            opacity: sensitiveShown ? 0.35 : undefined
          }}
        >
          <Slider
            minimumValue={0}
            maximumValue={audio.meta.original.duration * 1000}
            value={audioPosition}
            minimumTrackTintColor={colors.secondary}
            maximumTrackTintColor={colors.disabled}
            // onSlidingStart={() => {
            //   audioPlayer?.pauseAsync()
            //   setAudioPlaying(false)
            // }}
            // onSlidingComplete={value => {
            //   setAudioPosition(value)
            // }}
            enabled={false} // Bug in above sliding actions
            thumbSize={StyleConstants.Spacing.M}
            thumbTintColor={colors.primaryOverlay}
          />
        </View>
      ) : null}
      <AttachmentAltText sensitiveShown={sensitiveShown} text={audio.description} />
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexBasis: '50%',
    padding: StyleConstants.Spacing.XS / 2,
    flexDirection: 'row'
  },
  background: { position: 'absolute', width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default AttachmentAudio
