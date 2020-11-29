export default {
  headers: {
    local: {
      segments: {
        left: 'Following',
        right: 'Local'
      }
    },
    public: {
      segments: {
        left: 'Federated',
        right: 'Others'
      }
    },
    notifications: 'Notifications',
    me: {
      root: 'My Mastodon',
      conversations: 'Messages',
      bookmarks: 'Booksmarks',
      favourites: 'Favourites',
      lists: {
        root: 'Lists',
        list: 'List {{list}}'
      },
      settings: {
        root: 'Settings',
        language: 'Language'
      }
    }
  }
}
