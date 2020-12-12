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

  type QueryKey = [
    Pages,
    {
      page: Pages
      hashtag?: Mastodon.Tag['name']
      list?: Mastodon.List['id']
      toot?: Mastodon.Status
      account?: Mastodon.Account['id']
    }
  ]
}
