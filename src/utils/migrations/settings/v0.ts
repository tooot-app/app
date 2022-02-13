export type SettingsV0 = {
  fontsize: -1 | 0 | 1 | 2 | 3
  language: string
  theme: 'light' | 'dark' | 'auto'
  browser: 'internal' | 'external'
  analytics: boolean
}
