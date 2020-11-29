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
    infoPlist: {
      CFBundleAllowMixedLocalizations: true
    },
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    }
  },
  locales: {
    zh: {
      CFBundleDisplayName: '我的嘟嘟'
    },
    en: {
      CFBundleDisplayName: 'My Toots'
    }
  },
  assetBundlePatterns: ['assets/*']
})
