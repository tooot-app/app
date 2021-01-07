import NetInfo from '@react-native-community/netinfo'
import { onlineManager } from 'react-query'
import log from './log'

const onlineStatus = () =>
  onlineManager.setEventListener(setOnline => {
    log('log', 'onlineStatus', 'added onlineManager listener')
    return NetInfo.addEventListener(state => {
      log('log', 'onlineStatus', `setting online state ${state.isConnected}`)
      // @ts-ignore
      setOnline(state.isConnected)
    })
  })

export default onlineStatus
