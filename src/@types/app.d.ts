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
    uri: string
    width: number
    height: number
    type?: 'image' | 'video'
  }
}
