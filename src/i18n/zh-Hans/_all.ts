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
  meSettingsFontsize: require('./screens/meSettingsFontsize').default,
  meSettingsPush: require('./screens/meSettingsPush').default,
  meSwitch: require('./screens/meSwitch').default,

  sharedAccount: require('./screens/sharedAccount').default,
  sharedAnnouncements: require('./screens/sharedAnnouncements').default,
  sharedAttachments: require('./screens/sharedAttachments').default,
  sharedCompose: require('./screens/sharedCompose').default,
  sharedRelationships: require('./screens/sharedRelationships').default,
  sharedSearch: require('./screens/sharedSearch').default,
  sharedToot: require('./screens/sharedToot').default,

  componentInstance: require('./components/instance').default,
  componentParse: require('./components/parse').default,
  componentRelationship: require('./components/relationship').default,
  componentRelativeTime: require('./components/relativeTime').default,
  componentTimeline: require('./components/timeline').default,

  screenImageViewer: require('./screens/screenImageViewer').default
}
