declare namespace store {
  type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

  type InstanceInfoState = {
    local: string
    localToken: string
    remote: string
  }

  type TimelinePage =
    | 'Following'
    | 'Local'
    | 'LocalPublic'
    | 'RemotePublic'
    | 'Notifications'
    | 'Hashtag'
    | 'List'
    | 'Toot'
    | 'Account_Default'
    | 'Account_All'
    | 'Account_Media'

  type TimelineState = {
    toots: mastodon.Status[] | []
    pointer?: string
    status: AsyncStatus
  }

  type TimelinesState = {
    Following: TimelineState
    Local: TimelineState
    LocalPublic: TimelineState
    RemotePublic: TimelineState
    Notifications: TimelineState
    Hashtag: TimelineState
    List: TimelineState
    Toot: TimelineState
    Account_Default: TimelineState
    Account_All: TimelineState
    Account_Media: TimelineState
  }

  type AccountState = {
    account: mastodon.Account | {}
    status: AsyncStatus
  }
}
