export default {
  content: {
    collections: {
      conversations: '$t(meConversations:heading)',
      bookmarks: '$t(meBookmarks:heading)',
      favourites: '$t(meFavourites:heading)',
      lists: '$t(meLists:heading)',
      announcements: {
        heading: '$t(sharedAnnouncements:heading)',
        content: {
          unread: '{{amount}} unread',
          read: 'All read',
          empty: 'None'
        }
      }
    },
    accountSettings: 'Account Settings',
    appSettings: '$t(meSettings:heading)',
    logout: {
      button: 'Log out',
      alert: {
        title: 'Logging out?',
        message: 'After logging out, you need to log in again',
        buttons: {
          logout: 'Logout',
          cancel: '$t(common:buttons.cancel)'
        }
      }
    }
  }
}
