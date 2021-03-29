export default {
  common: require('./common'),

  screens: require('./screens'),
  screenActions: require('./screens/actions'),
  screenAnnouncements: require('./screens/announcements'),
  screenCompose: require('./screens/compose'),
  screenImageViewer: require('./screens/imageViewer'),
  screenTabs: require('./screens/tabs'),

  componentInstance: require('./components/instance'),
  componentParse: require('./components/parse'),
  componentRelationship: require('./components/relationship'),
  componentRelativeTime: require('./components/relativeTime'),
  componentTimeline: require('./components/timeline')
}
