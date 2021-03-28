export default {
  common: require('./common'),

  local: require('./screens/local'),

  public: require('./screens/public'),

  notifications: require('./screens/notifications'),

  meRoot: require('./screens/meRoot'),
  meConversations: require('./screens/meConversations'),
  meBookmarks: require('./screens/meBookmarks'),
  meFavourites: require('./screens/meFavourites'),
  meLists: require('./screens/meLists'),
  meListsList: require('./screens/meListsList'),
  meSettings: require('./screens/meSettings'),
  meSettingsFontsize: require('./screens/meSettingsFontsize'),
  meSettingsPush: require('./screens/meSettingsPush'),
  meSwitch: require('./screens/meSwitch'),

  sharedAccount: require('./screens/sharedAccount'),
  sharedAnnouncements: require('./screens/sharedAnnouncements'),
  sharedAttachments: require('./screens/sharedAttachments'),
  sharedCompose: require('./screens/sharedCompose'),
  sharedSearch: require('./screens/sharedSearch'),
  sharedToot: require('./screens/sharedToot'),
  sharedUsers: require('./screens/sharedUsers'),

  componentInstance: require('./components/instance'),
  componentParse: require('./components/parse'),
  componentRelationship: require('./components/relationship'),
  componentRelativeTime: require('./components/relativeTime'),
  componentTimeline: require('./components/timeline'),

  screenActions: require('./screens/screenActions'),
  screenImageViewer: require('./screens/screenImageViewer')
}
