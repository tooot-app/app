import { store } from '@root/store'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { getSettingsBrowser } from './slices/settingsSlice'

const openLink = async (url: string) => {
  switch (getSettingsBrowser(store.getState())) {
    case 'internal':
      await WebBrowser.openBrowserAsync(url)
      break
    case 'external':
      await Linking.openURL(url)
      break
  }
}

export default openLink
