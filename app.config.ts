import { ExpoConfig } from '@expo/config'

export default (): ExpoConfig => ({
  name: 'mastodon-app',
  description: 'This is a description',
  slug: 'mastodon-app',
  privacy: 'hidden',
  version: '1.0.0',
  platforms: ['ios'],
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/icon.png',
  developmentClient: { silentLaunch: true },
  scheme: 'mastodonct',
  ios: {
    bundleIdentifier: 'com.xmflsct.app.mastodon',
    infoPlist: {
      CFBundleAllowMixedLocalizations: true
    },
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    googleServicesFile: './configs/GoogleService-Info.plist'
  },
  // locales: {
  //   zh: {
  //     CFBundleDisplayName: '我的嘟嘟'
  //   },
  //   en: {
  //     CFBundleDisplayName: 'My Toots'
  //   }
  // },
  assetBundlePatterns: ['assets/*'],
  web: {
    config: {
      firebase: {
        apiKey: 'AIzaSyAnvo0jyD1WB0tv2FLenz-CSDS-RgaWWR4',
        authDomain: 'xmflsct-mastodon-app.firebaseapp.com',
        projectId: 'xmflsct-mastodon-app',
        storageBucket: 'xmflsct-mastodon-app.appspot.com',
        messagingSenderId: '661638997772',
        appId: '1:661638997772:web:1e7aab28be7dc06d9f8b29',
        measurementId: 'G-3J0FS8WV5J'
      }
    }
  }
})
