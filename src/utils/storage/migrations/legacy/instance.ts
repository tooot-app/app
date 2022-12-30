import { ComposeStateDraft } from '@screens/Compose/utils/types'

export type LegacyInstance = {
  active: boolean
  appData: {
    clientId: string
    clientSecret: string
  }
  url: string
  token: string
  uri: Mastodon.Instance<'v1'>['uri']
  urls: Mastodon.Instance<'v1'>['urls']
  account: {
    id: Mastodon.Account['id']
    acct: Mastodon.Account['acct']
    avatarStatic: Mastodon.Account['avatar_static']
    preferences?: Mastodon.Preferences
  }
  version: string
  configuration?: Mastodon.Instance<any>['configuration']
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
    'admin.sign_up'?: boolean
    'admin.report'?: boolean
  }
  push: {
    global: { value: boolean } | boolean
    decode: { value: boolean } | boolean
    alerts: {
      follow: { value: boolean } | boolean
      follow_request: { value: boolean } | boolean
      favourite: { value: boolean } | boolean
      reblog: { value: boolean } | boolean
      mention: { value: boolean } | boolean
      poll: { value: boolean } | boolean
      status?: { value: boolean } | boolean
      update?: { value: boolean } | boolean
      'admin.sign_up': { value: boolean } | boolean
      'admin.report': { value: boolean } | boolean
    }
    keys: { auth?: string }
  }
  followingPage?: {
    showBoosts: boolean
    showReplies: boolean
  }
  mePage: {
    followedTags?: { shown: boolean }
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
