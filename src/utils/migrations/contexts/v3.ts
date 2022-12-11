import { ScreenTabsStackParamList } from '@utils/navigation/navigators'

export type ContextsV3 = {
  storeReview: {
    context: Readonly<number>
    current: number
    shown: boolean
  }
  publicRemoteNotice: {
    context: Readonly<number>
    current: number
    hidden: boolean
  }
  previousTab: Extract<
    keyof ScreenTabsStackParamList,
    'Tab-Local' | 'Tab-Public' | 'Tab-Notifications' | 'Tab-Me'
  >
  previousSegment: Extract<App.Pages, 'Local' | 'LocalPublic' | 'Trending'>
}
