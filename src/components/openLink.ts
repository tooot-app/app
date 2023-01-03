import browserPackage from '@utils/helpers/browserPackage'
import { urlMatcher } from '@utils/helpers/urlMatcher'
import navigationRef from '@utils/navigation/navigationRef'
import { queryClient } from '@utils/queryHooks'
import { QueryKeyAccount } from '@utils/queryHooks/account'
import { searchLocalAccount, searchLocalStatus } from '@utils/queryHooks/search'
import { QueryKeyStatus } from '@utils/queryHooks/status'
import { getGlobalStorage } from '@utils/storage/actions'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'

export let loadingLink = false

const openLink = async (url: string, navigation?: any) => {
  if (loadingLink) {
    return
  }

  const handleNavigation = (page: 'Tab-Shared-Toot' | 'Tab-Shared-Account', options: any) => {
    if (navigation) {
      navigation.push(page, options)
    } else {
      // @ts-ignore
      navigationRef.navigate(page, options)
    }
  }

  const match = urlMatcher(url)
  // If a tooot can be found
  if (match?.status?.id) {
    loadingLink = true
    let response: Mastodon.Status | undefined = undefined

    const queryKey: QueryKeyStatus = [
      'Status',
      { id: match.status.id, uri: url, _remote: match.status._remote }
    ]
    const cache = queryClient.getQueryData<Mastodon.Status>(queryKey)

    if (cache) {
      handleNavigation('Tab-Shared-Toot', { toot: cache })
      loadingLink = false
      return
    } else {
      try {
        response = await searchLocalStatus(url)
      } catch {}
      if (response) {
        handleNavigation('Tab-Shared-Toot', { toot: response })
        loadingLink = false
        return
      }
    }
  }

  // If an account can be found
  if (match?.account) {
    if (!match.account._remote && match.account.id) {
      handleNavigation('Tab-Shared-Account', { account: match.account.id })
      return
    }

    loadingLink = true
    let response: Mastodon.Account | undefined = undefined

    const queryKey: QueryKeyAccount = [
      'Account',
      { id: match.account.id, url: url, _remote: match.account._remote }
    ]
    const cache = queryClient.getQueryData<Mastodon.Status>(queryKey)

    if (cache) {
      handleNavigation('Tab-Shared-Account', { account: cache })
      loadingLink = false
      return
    } else {
      try {
        response = await searchLocalAccount(url)
      } catch {}
      if (response) {
        handleNavigation('Tab-Shared-Account', { account: response })
        loadingLink = false
        return
      }
    }
  }

  loadingLink = false
  switch (getGlobalStorage.string('app.browser')) {
    // Some links might end with an empty space at the end that triggers an error
    case 'internal':
      await WebBrowser.openBrowserAsync(url.trim(), {
        dismissButtonStyle: 'close',
        enableBarCollapsing: true,
        ...(await browserPackage())
      })
      break
    case 'external':
      await Linking.openURL(url.trim())
      break
  }
}

export default openLink
