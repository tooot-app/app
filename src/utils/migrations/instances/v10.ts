import { ComposeStateDraft } from '@screens/Compose/utils/types'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'

export type InstanceV10 = {
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
    preferences: Mastodon.Preferences
  }
  version: string
  configuration?: Mastodon.Instance['configuration']
  filters: Mastodon.Filter[]
  notifications_filter: {
    follow: boolean
    follow_request: boolean
    favourite: boolean
    reblog: boolean
    mention: boolean
    poll: boolean
    status: boolean
    update: boolean
  }
  push: {
    global: { loading: boolean; value: boolean }
    decode: { loading: boolean; value: boolean }
    alerts: {
      follow: {
        loading: boolean
        value: Mastodon.PushSubscription['alerts']['follow']
      }
      follow_request: {
        loading: boolean
        value: Mastodon.PushSubscription['alerts']['follow_request']
      }
      favourite: {
        loading: boolean
        value: Mastodon.PushSubscription['alerts']['favourite']
      }
      reblog: {
        loading: boolean
        value: Mastodon.PushSubscription['alerts']['reblog']
      }
      mention: {
        loading: boolean
        value: Mastodon.PushSubscription['alerts']['mention']
      }
      poll: {
        loading: boolean
        value: Mastodon.PushSubscription['alerts']['poll']
      }
      status: {
        loading: boolean
        value: Mastodon.PushSubscription['alerts']['status']
      }
    }
    keys: {
      auth?: string
      public?: string // legacy
      private?: string // legacy
    }
  }
  timelinesLookback?: {
    [key: string]: {
      queryKey: QueryKeyTimeline
      ids: Mastodon.Status['id'][]
    }
  }
  mePage: {
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
