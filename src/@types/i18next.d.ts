import 'i18next'

import common from '../i18n/en/common.json'
import screens from '../i18n/en/screens.json'

import screenAccountSelection from '../i18n/en/screens/accountSelection.json'
import screenAnnouncements from '../i18n/en/screens/announcements.json'
import screenCompose from '../i18n/en/screens/compose.json'
import screenImageViewer from '../i18n/en/screens/imageViewer.json'
import screenTabs from '../i18n/en/screens/tabs.json'

import componentContextMenu from '../i18n/en/components/contextMenu.json'
import componentEmojis from '../i18n/en/components/emojis.json'
import componentInstance from '../i18n/en/components/instance.json'
import componentMediaSelector from '../i18n/en/components/mediaSelector.json'
import componentParse from '../i18n/en/components/parse.json'
import componentRelationship from '../i18n/en/components/relationship.json'
import componentTimeline from '../i18n/en/components/timeline.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof common
      screens: typeof screens

      screenAccountSelection: typeof screenAccountSelection
      screenAnnouncements: typeof screenAnnouncements
      screenCompose: typeof screenCompose
      screenImageViewer: typeof screenImageViewer
      screenTabs: typeof screenTabs

      componentContextMenu: typeof componentContextMenu
      componentEmojis: typeof componentEmojis
      componentInstance: typeof componentInstance
      componentMediaSelector: typeof componentMediaSelector
      componentParse: typeof componentParse
      componentRelationship: typeof componentRelationship
      componentTimeline: typeof componentTimeline
    }
    returnNull: false
    returnEmptyString: false
  }
}
