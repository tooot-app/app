import { store } from '@root/store'
import { getSettingsLanguage, supportedLngs } from '@utils/slices/settingsSlice'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '@root/i18n/en/_all'
import zh_Hans from '@root/i18n/zh-Hans/_all'

i18next.use(initReactI18next).init({
  lng: getSettingsLanguage(store.getState()),
  fallbackLng: 'en',
  supportedLngs: supportedLngs,

  ns: ['common'],
  defaultNS: 'common',

  resources: { 'zh-Hans': zh_Hans, en },

  saveMissing: true,
  missingKeyHandler: (ns, key) => {
    console.log('i18n missing: ' + ns + ' : ' + key)
  },

  interpolation: {
    escapeValue: false
  }
})

export default i18next
