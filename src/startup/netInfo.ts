import apiInstance from '@api/instance'
import NetInfo from '@react-native-community/netinfo'
import { store } from '@root/store'
import removeInstance from '@utils/slices/instances/remove'
import { getInstance, updateInstanceAccount } from '@utils/slices/instancesSlice'
import { onlineManager } from '@tanstack/react-query'
import log from './log'

const netInfo = async (): Promise<{
  connected?: boolean
  corrupted?: string
} | void> => {
  log('log', 'netInfo', 'initializing')

  const netInfo = await NetInfo.fetch()
  const instance = getInstance(store.getState())

  onlineManager.setEventListener(setOnline => {
    return NetInfo.addEventListener(state => {
      setOnline(!!state.isConnected)
    })
  })

  if (netInfo.isConnected) {
    log('log', 'netInfo', 'network connected')
    if (instance) {
      log('log', 'netInfo', 'checking locally stored credentials')

      let resVerify: Mastodon.Account
      try {
        resVerify = await apiInstance<Mastodon.Account>({
          method: 'get',
          url: `accounts/verify_credentials`
        }).then(res => res.body)
      } catch (error: any) {
        log('error', 'netInfo', 'local credential check failed')
        if (error?.status && error.status == 401) {
          store.dispatch(removeInstance(instance))
        }
        return Promise.resolve({ corrupted: error.data?.error })
      }

      log('log', 'netInfo', 'local credential check passed')
      if (resVerify.id !== instance.account.id) {
        log('error', 'netInfo', 'local id does not match remote id')
        store.dispatch(removeInstance(instance))
        return Promise.resolve({ connected: true, corrupted: '' })
      } else {
        store.dispatch(
          updateInstanceAccount({
            acct: resVerify.acct,
            avatarStatic: resVerify.avatar_static
          })
        )

        return Promise.resolve({ connected: true })
      }
    } else {
      log('log', 'netInfo', 'no local credential found')
      return Promise.resolve()
    }
  } else {
    log('warn', 'netInfo', 'network not connected')
    return Promise.resolve()
  }
}

export default netInfo
