import NetInfo from '@react-native-community/netinfo'
import { onlineManager } from '@tanstack/react-query'
import log from './log'

const netInfo = () => {
  log('log', 'netInfo', 'initializing')

  onlineManager.setEventListener(setOnline => {
    return NetInfo.addEventListener(state => {
      setOnline(!!state.isConnected)
    })
  })
}

export default netInfo
