export type ContextsV0 = {
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
}
