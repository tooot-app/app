import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'

const browserPackage = async (): Promise<{ browserPackage?: string }> => {
  if (Platform.OS === 'android') {
    const tabsSupportingBrowsers = await WebBrowser.getCustomTabsSupportingBrowsersAsync()
    return {
      browserPackage:
        tabsSupportingBrowsers?.preferredBrowserPackage ||
        tabsSupportingBrowsers.browserPackages[0] ||
        tabsSupportingBrowsers.servicePackages[0]
    }
  } else {
    return {}
  }
}

export default browserPackage
