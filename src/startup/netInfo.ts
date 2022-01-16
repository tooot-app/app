import apiInstance from '@api/instance'
import NetInfo from '@react-native-community/netinfo'
import { store } from '@root/store'
import { prefetchTimelineQuery } from '@utils/queryHooks/timeline'
import { getPreviousTab } from '@utils/slices/contextsSlice'
import removeInstance from '@utils/slices/instances/remove'
import {
  getInstance,
  updateInstanceAccount
} from '@utils/slices/instancesSlice'
import { onlineManager } from 'react-query'
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
      setOnline(
        typeof state.isConnected === 'boolean' ? state.isConnected : undefined
      )
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
        if (error.status && error.status == 401) {
          store.dispatch(removeInstance(instance))
        }
        return Promise.resolve({ corrupted: error.data.error })
      }

      log('log', 'netInfo', 'local credential check passed')
      if (resVerify.id !== instance.account.id) {
        log('error', 'netInfo', 'local id does not match remote id')
        store.dispatch(removeInstance(instance))
        return Promise.resolve({ connected: true, corruputed: '' })
      } else {
        store.dispatch(
          updateInstanceAccount({
            acct: resVerify.acct,
            avatarStatic: resVerify.avatar_static
          })
        )

        if (instance.timelinesLookback) {
          const previousTab = getPreviousTab(store.getState())
          let loadPage: Extract<
            App.Pages,
            'Following' | 'Local' | 'LocalPublic'
          > | void = undefined
          if (previousTab === 'Tab-Local') {
            loadPage = 'Following'
          } else if (previousTab === 'Tab-Public') {
            loadPage = 'LocalPublic'
          }

          if (loadPage) {
            if (instance.timelinesLookback?.[loadPage]?.ids.length > 0) {
              log(
                'log',
                'netInfo',
                `prefetching landing page ${instance.timelinesLookback[loadPage].queryKey[1].page} ids: ${instance.timelinesLookback[loadPage].ids}`
              )
              const prefetch = await prefetchTimelineQuery(
                instance.timelinesLookback[loadPage]
              )
              if (prefetch) {
                log('log', 'netInfo', `prefetched from status id ${prefetch}`)
              } else {
                log('error', 'netInfo', 'failed to prefetch')
              }
            }
          }
          for (const page of Object.keys(instance.timelinesLookback)) {
            if (page !== loadPage) {
              log(
                'log',
                'netInfo',
                `prefetching other page ${instance.timelinesLookback[page].queryKey[1].page} ids: ${instance.timelinesLookback[page].ids}`
              )
              prefetchTimelineQuery(instance.timelinesLookback[page])
            }
          }
        }

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
