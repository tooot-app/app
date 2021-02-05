import { preventScreenCaptureAsync } from 'expo-screen-capture'
import log from './log'

const preventScreenshot = () => {
  log('log', 'Screenshot', 'preventing')
  preventScreenCaptureAsync()
}

export default preventScreenshot
