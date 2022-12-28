import NetInfo from '@react-native-community/netinfo'
import { onlineManager } from '@tanstack/react-query'
import apiInstance from '@utils/api/instance'
import { storage } from '@utils/storage'
import { getAccountStorage, removeAccount, setAccountStorage } from '@utils/storage/actions'
import log from './log'

const netInfo = async (): Promise<{
  connected?: boolean
  corrupted?: string
} | void> => {
  log('log', 'netInfo', 'initializing')

  const netInfo = await NetInfo.fetch()

  onlineManager.setEventListener(setOnline => {
    return NetInfo.addEventListener(state => {
      setOnline(!!state.isConnected)
    })
  })

  if (netInfo.isConnected) {
    log('log', 'netInfo', 'network connected')
    if (storage.account) {
      const domain = getAccountStorage.string('auth.domain')
      const id = getAccountStorage.string('auth.account.id')
      const account = `${domain}/${id}`
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
          removeAccount(account)
        }
        return Promise.resolve({ corrupted: error.data?.error })
      }

      log('log', 'netInfo', 'local credential check passed')
      if (resVerify.id !== id) {
        log('error', 'netInfo', 'local id does not match remote id')
        removeAccount(account)
        return Promise.resolve({ connected: true, corrupted: '' })
      } else {
        setAccountStorage([
          { key: 'auth.account.acct', value: resVerify.acct },
          { key: 'auth.account.avatar_static', value: resVerify.avatar_static }
        ])

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
