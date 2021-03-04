import { store } from '@root/store'
import { getSettingsBrowser } from '@utils/slices/settingsSlice'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'

const openLink = async (url: string) => {
  switch (getSettingsBrowser(store.getState())) {
    case 'internal':
      await WebBrowser.openBrowserAsync(url, {
        dismissButtonStyle: 'close',
        enableBarCollapsing: true
      })
      break
    case 'external':
      await Linking.openURL(url)
      break
  }
}

export default openLink
