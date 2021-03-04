type InstanceLocal = {
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
  notification: {
    readTime?: Mastodon.Notification['created_at']
    latestTime?: Mastodon.Notification['created_at']
  }
  drafts: any[]
}

export type InstancesV3 = {
  local: {
    activeIndex: number | null
    instances: InstanceLocal[]
  }

  remote: {
    url: string
  }
}
