import { ComposeStateDraft } from '@screens/Compose/utils/types'

export type InstanceV11 = {
  active: boolean
  appData: {
    clientId: string
    clientSecret: string
  }
  url: string
  token: string
  uri: Mastodon.Instance['uri']
  urls: Mastodon.Instance['urls']
  account: {
    id: Mastodon.Account['id']
    acct: Mastodon.Account['acct']
    avatarStatic: Mastodon.Account['avatar_static']
    preferences?: Mastodon.Preferences
  }
  version: string
  configuration?: Mastodon.Instance['configuration']
  filters: Mastodon.Filter<any>[]
  notifications_filter: {
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
  push: {
    global: boolean
    decode: boolean
    alerts: Mastodon.PushSubscription['alerts']
    keys: {
      auth?: string
      public?: string // legacy
      private?: string // legacy
    }
  }
  followingPage: {
    showBoosts: boolean
    showReplies: boolean
  }
  mePage: {
    followedTags: { shown: boolean }
    lists: { shown: boolean }
    announcements: { shown: boolean; unread: number }
  }
  drafts: ComposeStateDraft[]
  frequentEmojis: {
    emoji: Pick<Mastodon.Emoji, 'shortcode' | 'url' | 'static_url'>
    score: number
    count: number
    lastUsed: number
  }[]
}
