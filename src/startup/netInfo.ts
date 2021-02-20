import apiInstance from '@api/instance'
import NetInfo from '@react-native-community/netinfo'
import { store } from '@root/store'
import removeInstance from '@utils/slices/instances/remove'
import {
  getInstanceActive,
  updateInstanceAccount
} from '@utils/slices/instancesSlice'
import log from './log'

const netInfo = async (): Promise<{
  connected: boolean
  corrupted?: string
}> => {
  log('log', 'netInfo', 'initializing')
  const netInfo = await NetInfo.fetch()
  const activeIndex = getInstanceActive(store.getState())

  if (netInfo.isConnected) {
    log('log', 'netInfo', 'network connected')
    if (activeIndex !== -1) {
      log('log', 'netInfo', 'checking locally stored credentials')
      return apiInstance<Mastodon.Account>({
        method: 'get',
        url: `accounts/verify_credentials`
      })
        .then(res => {
          log('log', 'netInfo', 'local credential check passed')
          if (
            res.body.id !==
            store.getState().instances.instances[activeIndex].account.id
          ) {
            log('error', 'netInfo', 'local id does not match remote id')
            store.dispatch(removeInstance(activeIndex))
            return Promise.resolve({ connected: true, corruputed: '' })
          } else {
            store.dispatch(
              updateInstanceAccount({
                acct: res.body.acct,
                avatarStatic: res.body.avatar_static
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
            store.dispatch(removeInstance(activeIndex))
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
