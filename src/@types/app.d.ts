declare namespace App {
  type Pages =
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
    | 'Conversations'
    | 'Bookmarks'
    | 'Favourites'
}

declare namespace QueryKey {
  type Account = [
    'Account',
    {
      id: Mastodon.Account['id']
    }
  ]

  type Announcements = [
    'Announcements',
    {
      showAll?: boolean
    }
  ]

  type Application = [
    'Application',
    {
      instanceDomain: string
    }
  ]

  type Instance = [
    'Instance',
    {
      instanceDomain: string
    }
  ]

  type Relationship = [
    'Relationship',
    {
      id: Mastodon.Account['id']
    }
  ]

  type Search = [
    'Search',
    {
      type?: 'accounts' | 'hashtags' | 'statuses'
      term: string
      limit?: number
    }
  ]

  type Timeline = [
    Pages,
    {
      hashtag?: Mastodon.Tag['name']
      list?: Mastodon.List['id']
      toot?: Mastodon.Status
      account?: Mastodon.Account['id']
    }
  ]
}
