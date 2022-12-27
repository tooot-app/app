import { ScreenTabsStackParamList } from '@utils/navigation/navigators'

export type GlobalV0 = {
  //// app
  // string
  'app.expo_token': string
  'app.prev_tab': keyof ScreenTabsStackParamList
  'app.prev_public_segment': Extract<App.Pages, 'Local' | 'LocalPublic' | 'Trending'>
  'app.language': string
  'app.theme': 'light' | 'dark' | 'auto'
  'app.theme.dark': 'lighter' | 'darker'
  'app.browser': 'internal' | 'external'
  // number
  'app.count_till_store_review': number
  'app.font_size': -1 | 0 | 1 | 2 | 3
  // boolean
  'app.auto_play_gifv': boolean

  //// account
  // string
  'account.active': string
  // object
  accounts: string[]
}
