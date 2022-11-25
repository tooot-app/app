import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av'
import log from './log'

const audio = () => {
  log('log', 'audio', 'setting audio playback default options')
  Audio.setAudioModeAsync({
    interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false
  })
}

export default audio
