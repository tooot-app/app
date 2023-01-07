import { ComposeStateDraft } from '@screens/Compose/utils/types'

type PushNotification = {
  follow: boolean
  follow_request: boolean
  favourite: boolean
  reblog: boolean
  mention: boolean
  poll: boolean
  status: boolean
  update: boolean
  'admin.sign_up': boolean
  'admin.report': boolean
}

export type AccountV0 = {
  // string
  'auth.clientId': string
  'auth.clientSecret': string
  'auth.token': string
  'auth.domain': string // used for API
  'auth.account.id': string
  'auth.account.acct': string
  'auth.account.domain': string // used for username
  'auth.account.avatar_static': string
  version: string
  read_marker_following?: string
  // number
  // boolean
  // object
  preferences?: Mastodon.Preferences
  followed_tags?: Pick<Mastodon.Tag, 'name' | 'following'>[]
  notifications: PushNotification
  push: {
    global: boolean
    decode: boolean
    alerts: PushNotification
    key: string
  }
  page_local: {
    showBoosts: boolean
    showReplies: boolean
  }
  page_me: {
    followedTags: {
      shown: boolean
    }
    lists: {
      shown: boolean
    }
    announcements: {
      shown: boolean
      unread: number
    }
  }
  drafts: ComposeStateDraft[]
  emojis_frequent: {
    emoji: Pick<Mastodon.Emoji, 'url' | 'shortcode' | 'static_url'>
    score: number
    count: number
    lastUsed: number
  }[]
}
