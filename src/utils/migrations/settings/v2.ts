export type SettingsV2 = {
  fontsize: -1 | 0 | 1 | 2 | 3
  language: string
  theme: 'light' | 'dark' | 'auto'
  darkTheme: 'lighter' | 'darker'
  browser: 'internal' | 'external'
  staticEmoji: boolean
  analytics: boolean
}
