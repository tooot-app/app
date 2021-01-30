import { ExpoConfig } from '@expo/config'
import 'dotenv/config'

export default (): ExpoConfig => ({
  name: 'tooot',
  description: 'tooot for Mastodon',
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
  assetBundlePatterns: ['assets/*'],
  extra: {
    sentryDSN: process.env.SENTRY_DSN,
    sentryEnv: process.env.SENTRY_DEPLOY_ENV
  },
  hooks: {
    postPublish: [
      {
        file: 'sentry-expo/upload-sourcemaps',
        config: {
          organization: process.env.SENTRY_ORGANIZATION,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
          setCommits: process.env.GITHUB_SHA || undefined,
          deployEnv: process.env.SENTRY_DEPLOY_ENV
        }
      }
    ]
  },
  ios: {
    buildNumber: '4',
    config: { usesNonExemptEncryption: false },
    bundleIdentifier: 'com.xmflsct.app.tooot',
    googleServicesFile: './configs/GoogleService-Info.plist',
    infoPlist: {
      CFBundleAllowMixedLocalizations: true
    }
  },
  locales: {
    en: './src/i18n/en/system.json',
    zh: './src/i18n/zh-Hans/system.json'
  },
  android: {
    versionCode: 4,
    package: 'com.xmflsct.app.tooot',
    googleServicesFile: './configs/google-services.json',
    permissions: ['CAMERA', 'VIBRATE']
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
