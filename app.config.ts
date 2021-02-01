import { ExpoConfig } from '@expo/config'
import 'dotenv/config'

export default (): ExpoConfig => ({
  name: 'tooot',
  description: 'tooot for Mastodon',
  slug: 'tooot',
  privacy: 'hidden',
  sdkVersion: '40.0.0',
  version: '0.8',
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
  locales: {
    en: './src/i18n/en/system.json',
    zh: './src/i18n/zh-Hans/system.json'
  },
  android: {
    versionCode: 4,
    package: 'com.xmflsct.app.tooot',
    googleServicesFile: './configs/google-services.json',
    permissions: ['CAMERA', 'VIBRATE']
  }
})
