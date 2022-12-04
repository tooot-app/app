import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'

const browserPackage = async () => {
  let browserPackage: string | undefined
  if (Platform.OS === 'android') {
    const tabsSupportingBrowsers = await WebBrowser.getCustomTabsSupportingBrowsersAsync()
    browserPackage =
      tabsSupportingBrowsers?.preferredBrowserPackage ||
      tabsSupportingBrowsers.browserPackages[0] ||
      tabsSupportingBrowsers.servicePackages[0]
  }
  return browserPackage
}

export default browserPackage
