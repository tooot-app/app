import { ExpoConfig } from '@expo/config'

export default (): ExpoConfig => ({
  name: 'tooot',
  description: 'tooot for mastodon',
  slug: 'tooot',
  privacy: 'hidden',
  sdkVersion: '40.0.0',
  version: '0.1.0',
  platforms: ['ios', 'android'],
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/icon.png',
  splash: {
    backgroundColor: '#FAFAFA',
    image: './assets/splash.png'
  },
  scheme: 'tooot',
  ios: {
    bundleIdentifier: 'com.xmflsct.app.tooot',
    googleServicesFile: './configs/GoogleService-Info.plist',
    infoPlist: {
      CFBundleAllowMixedLocalizations: true
    }
  },
  android: {
    package: 'com.xmflsct.app.tooot',
    googleServicesFile: './configs/google-services.json',
    permissions: ['CAMERA', 'VIBRATE']
  },
  locales: {
    zh: './src/i18n/zh/app.json',
    en: {
      CFBundleDisplayName: 'tooot'
    }
  },
  assetBundlePatterns: ['assets/*'],
  hooks: {
    postPublish: [
      {
        file: 'sentry-expo/upload-sourcemaps'
      }
    ]
  },
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
