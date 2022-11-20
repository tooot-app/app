import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av'
import log from './log'

const audio = () => {
  log('log', 'audio', 'setting audio playback default options')
  Audio.setAudioModeAsync({
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    staysActiveInBackground: false
  })
}

export default audio
