export default {
  heading: '我的长毛象',
  content: {
    login: {},
    collections: {
      conversations: '$t(meConversations:heading)',
      bookmarks: '$t(meBookmarks:heading)',
      favourites: '$t(meFavourites:heading)',
      lists: '$t(meLists:heading)'
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
