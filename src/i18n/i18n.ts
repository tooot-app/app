import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import zh from '@root/i18n/zh/_all'
import en from '@root/i18n/en/_all'
import {
  changeLanguage,
  getSettingsLanguage
} from '@utils/slices/settingsSlice'
import { store } from '@root/store'

if (!getSettingsLanguage(store.getState())) {
  const deviceLocal = Localization.locale
  if (deviceLocal.startsWith('zh')) {
    store.dispatch(changeLanguage('zh-CN'))
  } else {
    store.dispatch(changeLanguage('en-US'))
  }
}
i18next.use(initReactI18next).init({
  lng: 'zh-CN',
  fallbackLng: 'en-US',
  supportedLngs: ['zh-CN', 'en-US'],

  ns: ['common'],
  defaultNS: 'common',

  resources: { 'zh-CN': zh, 'en-US': en },

  saveMissing: true,
  missingKeyHandler: (lng, ns, key, fallbackValue) => {
    console.log('i18n missing: ' + lng + ' - ' + ns + ' : ' + key)
  },

  // react options
  interpolation: {
    escapeValue: false
  }
})

export default i18next
