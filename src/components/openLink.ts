import apiInstance from '@api/instance'
import navigationRef from '@helpers/navigationRef'
import { NavigationProp, ParamListBase } from '@react-navigation/native'
import { store } from '@root/store'
import { SearchResult } from '@utils/queryHooks/search'
import { getInstanceUrl } from '@utils/slices/instancesSlice'
import { getSettingsBrowser } from '@utils/slices/settingsSlice'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'

// https://social.xmflsct.com/web/statuses/105590085754428765 <- default
// https://social.xmflsct.com/@tooot/105590085754428765 <- pretty
const matcherStatus = new RegExp(
  /http[s]?:\/\/(.*)\/(web\/statuses|@.*)\/([0-9]*)/
)

// https://social.xmflsct.com/web/accounts/14195 <- default
// https://social.xmflsct.com/@tooot <- pretty
const matcherAccount = new RegExp(
  /http[s]?:\/\/(.*)\/(web\/accounts\/([0-9]*)|@.*)/
)

export let loadingLink = false

const openLink = async (
  url: string,
  navigation?: NavigationProp<
    ParamListBase,
    string,
    Readonly<{
      key: string
      index: number
      routeNames: string[]
      history?: unknown[] | undefined
      routes: any[]
      type: string
      stale: false
    }>,
    {},
    {}
  >
) => {
  if (loadingLink) {
    return
  }

  const handleNavigation = (
    page: 'Tab-Shared-Toot' | 'Tab-Shared-Account',
    options: {}
  ) => {
    if (navigation) {
      // @ts-ignore
      navigation.push(page, options)
    } else {
      navigationRef.current?.navigate(page, options)
    }
  }

  // If a tooot can be found
  const matchedStatus = url.match(matcherStatus)
  if (matchedStatus) {
    // If the link in current instance
    const instanceUrl = getInstanceUrl(store.getState())
    if (matchedStatus[1] === instanceUrl) {
      handleNavigation('Tab-Shared-Toot', {
        toot: { id: matchedStatus[3] }
      })
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
  const matchedAccount = url.match(matcherAccount)
  console.log(matchedAccount)
  if (matchedAccount) {
    // If the link in current instance
    const instanceUrl = getInstanceUrl(store.getState())
    if (matchedAccount[1] === instanceUrl) {
      if (matchedAccount[3] && matchedAccount[3].match(/[0-9]*/)) {
        handleNavigation('Tab-Shared-Account', {
          account: { id: matchedAccount[3] }
        })
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
        params: { type: 'accounts', q: url, limit: 1, resolve: true }
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
  switch (getSettingsBrowser(store.getState())) {
    // Some links might end with an empty space at the end that triggers an error
    case 'internal':
      await WebBrowser.openBrowserAsync(encodeURI(url), {
        dismissButtonStyle: 'close',
        enableBarCollapsing: true
      })
      break
    case 'external':
      await Linking.openURL(encodeURI(url))
      break
  }
}

export default openLink
