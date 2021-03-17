import { ComposeStateDraft } from "@screens/Compose/utils/types"

type Instance = {
  active: boolean
  appData: {
    clientId: string
    clientSecret: string
  }
  url: string
  token: string
  uri: Mastodon.Instance['uri']
  urls: Mastodon.Instance['urls']
  max_toot_chars: number
  account: {
    id: Mastodon.Account['id']
    acct: Mastodon.Account['acct']
    avatarStatic: Mastodon.Account['avatar_static']
    preferences: Mastodon.Preferences
  }
  push:
    | {
        global: { loading: boolean; value: boolean }
        decode: { loading: boolean; value: true }
        alerts: {
          follow: {
            loading: boolean
            value: Mastodon.PushSubscription['alerts']['follow']
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
        }
        keys: {
          auth: string
          public: string
          private: string
        }
      }
    | {
        global: { loading: boolean; value: boolean }
        decode: { loading: boolean; value: false }
        alerts: {
          follow: {
            loading: boolean
            value: Mastodon.PushSubscription['alerts']['follow']
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
        }
        keys: undefined
      }
  drafts: ComposeStateDraft[]
}

export type InstanceV4 = {
  instances: Instance[]
}
