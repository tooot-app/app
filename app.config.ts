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
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    }
  },
  assetBundlePatterns: ['**/*']
})
