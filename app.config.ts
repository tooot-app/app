import { ExpoConfig } from '@expo/config'
import { version } from './package.json'
import 'dotenv/config'

export default (): ExpoConfig => ({
  name: 'tooot',
  description: 'tooot for Mastodon',
  slug: 'tooot',
  scheme: 'tooot',
  version,
  extra: { environment: process.env.ENVIRONMENT },
  privacy: 'hidden',
  assetBundlePatterns: ['assets/*'],
  hooks: {
    postPublish: [
      {
        file: 'sentry-expo/upload-sourcemaps',
        config: {
          organization: process.env.SENTRY_ORGANIZATION,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
          setCommits: process.env.GITHUB_SHA || undefined,
          deployEnv: process.env.ENVIRONMENT
        }
      }
    ]
  },
  jsEngine: 'hermes',
  ios: {
    bundleIdentifier: 'com.xmflsct.app.tooot'
  },
  android: {
    package: 'com.xmflsct.app.tooot',
    googleServicesFile: './configs/google-services.json',
    permissions: ['CAMERA', 'VIBRATE'],
    blockedPermissions: ['USE_BIOMETRIC', 'USE_FINGERPRINT']
  },
  plugins: [
    [
      'expo-notifications',
      {
        sounds: ['./assets/sounds/boop.mp3']
      }
    ]
  ]
})
