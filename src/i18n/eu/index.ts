export default {
  common: require('./common'),

  screens: require('./screens'),
  screenAnnouncements: require('./screens/announcements'),
  screenCompose: require('./screens/compose'),
  screenImageViewer: require('./screens/imageViewer'),
  screenTabs: require('./screens/tabs'),

  componentContextMenu: require('./components/contextMenu'),
  componentEmojis: require('./components/emojis'),
  componentInstance: require('./components/instance'),
  componentMediaSelector: require('./components/mediaSelector'),
  componentParse: require('./components/parse'),
  componentRelationship: require('./components/relationship'),
  componentTimeline: require('./components/timeline')
}
