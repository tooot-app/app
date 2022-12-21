import apiInstance from '@api/instance'
import browserPackage from '@helpers/browserPackage'
import navigationRef from '@helpers/navigationRef'
import { matchAccount, matchStatus } from '@helpers/urlMatcher'
import { store } from '@root/store'
import { SearchResult } from '@utils/queryHooks/search'
import { getSettingsBrowser } from '@utils/slices/settingsSlice'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import validUrl from 'valid-url'

export let loadingLink = false

const openLink = async (url: string, navigation?: any) => {
  if (loadingLink) {
    return
  }

  const handleNavigation = (page: 'Tab-Shared-Toot' | 'Tab-Shared-Account', options: {}) => {
    if (navigation) {
      navigation.push(page, options)
    } else {
      // @ts-ignore
      navigationRef.navigate(page, options)
    }
  }

  // If a tooot can be found
  const isStatus = matchStatus(url)
  if (isStatus) {
    if (isStatus.sameInstance) {
      handleNavigation('Tab-Shared-Toot', { toot: { id: isStatus.id } })
      return
    }

    loadingLink = true
    let response
    try {
      response = await apiInstance<SearchResult>({
        version: 'v2',
        method: 'get',
        url: 'search',
        params: { type: 'statuses', q: url, limit: 1, resolve: true }
      })
    } catch {}
    if (response && response.body && response.body.statuses.length) {
      handleNavigation('Tab-Shared-Toot', {
        toot: response.body.statuses[0]
      })
      loadingLink = false
      return
    }
  }

  // If an account can be found
  const isAccount = matchAccount(url)
  if (isAccount) {
    if (isAccount.sameInstance) {
      if (isAccount.style === 'default' && isAccount.id) {
        handleNavigation('Tab-Shared-Account', { account: isAccount })
        return
      }
    }

    loadingLink = true
    let response
    try {
      response = await apiInstance<SearchResult>({
        version: 'v2',
        method: 'get',
        url: 'search',
        params: {
          type: 'accounts',
          q: isAccount.sameInstance && isAccount.style === 'pretty' ? isAccount.username : url,
          limit: 1,
          resolve: true
        }
      })
    } catch {}
    if (response && response.body && response.body.accounts.length) {
      handleNavigation('Tab-Shared-Account', {
        account: response.body.accounts[0]
      })
      loadingLink = false
      return
    }
  }

  loadingLink = false
  const validatedUrl = validUrl.isWebUri(url)
  if (validatedUrl) {
    switch (getSettingsBrowser(store.getState())) {
      // Some links might end with an empty space at the end that triggers an error
      case 'internal':
        await WebBrowser.openBrowserAsync(validatedUrl, {
          dismissButtonStyle: 'close',
          enableBarCollapsing: true,
          ...(await browserPackage())
        })
        break
      case 'external':
        await Linking.openURL(validatedUrl)
        break
    }
  }
}

export default openLink
