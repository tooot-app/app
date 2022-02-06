export type ContextsV1 = {
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
  previousTab: 'Tab-Local' | 'Tab-Public' | 'Tab-Notifications' | 'Tab-Me'
  mePage: {
    lists: { shown: boolean }
    announcements: { shown: boolean; unread: number }
  }
}
