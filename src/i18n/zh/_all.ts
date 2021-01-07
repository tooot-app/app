export default {
  common: require('./common').default,

  local: require('./screens/local').default,

  public: require('./screens/public').default,

  notifications: require('./screens/notifications').default,

  meRoot: require('./screens/meRoot').default,
  meConversations: require('./screens/meConversations').default,
  meBookmarks: require('./screens/meBookmarks').default,
  meFavourites: require('./screens/meFavourites').default,
  meLists: require('./screens/meLists').default,
  meListsList: require('./screens/meListsList').default,
  meSettings: require('./screens/meSettings').default,
  meSettingsUpdateRemote: require('./screens/meSettingsUpdateRemote').default,

  sharedAccount: require('./screens/sharedAccount').default,
  sharedToot: require('./screens/sharedToot').default,
  sharedAnnouncements: require('./screens/sharedAnnouncements').default,

  relationship: require('./components/relationship').default,
  timeline: require('./components/timeline').default
}
