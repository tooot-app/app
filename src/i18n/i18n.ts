import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '@root/i18n/en/_all'
import zh_Hans from '@root/i18n/zh-Hans/_all'

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',

  ns: ['common'],
  defaultNS: 'common',

  resources: { 'zh-Hans': zh_Hans, en },

  saveMissing: true,
  missingKeyHandler: (ns, key) => {
    console.log('i18n missing: ' + ns + ' : ' + key)
  },

  interpolation: {
    escapeValue: false
  },
  react: {
    useSuspense: false
  },
  debug: true
})

export default i18n
