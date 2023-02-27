import { ExpoConfig } from '@expo/config'
import { version } from './package.json'
import 'dotenv/config'

export default (): ExpoConfig => ({
  name: 'tooot',
  description: 'tooot for Mastodon',
  slug: 'tooot',
  scheme: 'tooot',
  version,
  // @ts-ignore
  extra: { environment: process.env.ENVIRONMENT },
  privacy: 'hidden',
  ios: {
    bundleIdentifier: 'com.xmflsct.app.tooot'
  },
  android: {
    package: 'com.xmflsct.app.tooot',
    permissions: ['NOTIFICATIONS', 'CAMERA', 'VIBRATE'],
    blockedPermissions: ['USE_BIOMETRIC', 'USE_FINGERPRINT'],
    googleServicesFile: './android/app/google-services.json'
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
