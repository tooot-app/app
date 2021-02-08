declare namespace App {
  type Pages =
    | 'Following'
    | 'Local'
    | 'LocalPublic'
    | 'Notifications'
    | 'Hashtag'
    | 'List'
    | 'Toot'
    | 'Account_Default'
    | 'Account_All'
    | 'Account_Attachments'
    | 'Conversations'
    | 'Bookmarks'
    | 'Favourites'

  interface IImageInfo {
    url: string
    width?: number
    height?: number
    originUrl?: string
    props?: any
  }
}
