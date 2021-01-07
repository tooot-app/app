import { Audio } from 'expo-av'
import log from "./log"

const audio = () => {
  log('log', 'audio', 'setting audio playback default options')
  Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    interruptionModeIOS: 1
  })
}

export default audio
