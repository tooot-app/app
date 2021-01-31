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
          unread: '{{amount}} 条未读公告',
          read: '无未读公告',
          empty: '无公告'
        }
      }
    },
    settings: '$t(meSettings:heading)',
    logout: {
      button: '退出当前账号',
      alert: {
        title: '确认退出登录？',
        message: '退出登录后，需要重新认证账号',
        buttons: {
          logout: '退出登录',
          cancel: '$t(common:buttons.cancel)'
        }
      }
    }
  }
}
