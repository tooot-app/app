import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import zh from 'src/i18n/zh/_all'
import en from 'src/i18n/en/_all'
import {
  changeLanguage,
  getSettingsLanguage
} from 'src/utils/slices/settingsSlice'
import { store } from 'src/store'

if (!getSettingsLanguage(store.getState())) {
  const deviceLocal = Localization.locale
  if (deviceLocal.startsWith('zh')) {
    store.dispatch(changeLanguage('zh'))
  } else {
    store.dispatch(changeLanguage('en'))
  }
}

i18next.use(initReactI18next).init({
  lng: getSettingsLanguage(store.getState()),
  fallbackLng: 'en',
  supportedLngs: ['zh', 'en'],
  nonExplicitSupportedLngs: true,

  ns: ['common'],
  defaultNS: 'common',

  resources: {
    zh: zh,
    en: en
  },

  saveMissing: true,
  missingKeyHandler: (lng, ns, key, fallbackValue) => {
    console.warn('i18n missing: ' + ns + ' : ' + key)
  },

  // react options
  interpolation: {
    escapeValue: false
  },

  debug: true
})

export default i18next
