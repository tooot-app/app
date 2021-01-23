import client from '@api/client'
import NetInfo from '@react-native-community/netinfo'
import { store } from '@root/store'
import {
  localRemoveInstance,
  localUpdateAccount
} from '@utils/slices/instancesSlice'
import log from './log'

const netInfo = async (): Promise<{
  connected: boolean
  corrupted?: string
}> => {
  log('log', 'netInfo', 'initializing')
  const netInfo = await NetInfo.fetch()
  const activeIndex = store.getState().instances.local?.activeIndex

  if (netInfo.isConnected) {
    log('log', 'netInfo', 'network connected')
    if (activeIndex) {
      log('log', 'netInfo', 'checking locally stored credentials')
      return client<Mastodon.Account>({
        method: 'get',
        instance: 'local',
        url: `accounts/verify_credentials`
      })
        .then(res => {
          log('log', 'netInfo', 'local credential check passed')
          if (
            res.id !==
            store.getState().instances.local?.instances[activeIndex].account.id
          ) {
            log('error', 'netInfo', 'local id does not match remote id')
            store.dispatch(localRemoveInstance(activeIndex))
            return Promise.resolve({ connected: true, corruputed: '' })
          } else {
            store.dispatch(
              localUpdateAccount({
                acct: res.acct,
                avatarStatic: res.avatar_static
              })
            )
            return Promise.resolve({ connected: true })
          }
        })
        .catch(error => {
          log('error', 'netInfo', 'local credential check failed')
          if (
            error.status &&
            typeof error.status === 'number' &&
            error.status === 401
          ) {
            store.dispatch(localRemoveInstance(activeIndex))
          }
          return Promise.resolve({
            connected: true,
            corrupted: error.data.error
          })
        })
    } else {
      log('log', 'netInfo', 'no local credential found')
      return Promise.resolve({ connected: true })
    }
  } else {
    log('warn', 'netInfo', 'network not connected')
    return Promise.resolve({ connected: true })
  }
}

export default netInfo
