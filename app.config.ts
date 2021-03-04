import { ExpoConfig } from '@expo/config'
import { versions } from './package.json'
import 'dotenv/config'

const toootVersion = `${versions.major}.${versions.minor}.${versions.patch}`

export default (): ExpoConfig => ({
  name: 'tooot',
  description: 'tooot for Mastodon',
  slug: 'tooot',
  version: toootVersion,
  sdkVersion: versions.expo,
  privacy: 'hidden',
  assetBundlePatterns: ['assets/*'],
  extra: {
    toootEnvironment: process.env.TOOOT_ENVIRONMENT,
    sentryDSN: process.env.SENTRY_DSN
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
          deployEnv: process.env.TOOOT_ENVIRONMENT
        }
      }
    ]
  },
  ios: {
    bundleIdentifier: 'com.xmflsct.app.tooot'
  },
  android: {
    versionCode: 4,
    package: 'com.xmflsct.app.tooot',
    googleServicesFile: './configs/google-services.json',
    permissions: ['CAMERA', 'VIBRATE']
  }
})
