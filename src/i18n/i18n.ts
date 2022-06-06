import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import de from '@root/i18n/de/_all'
import en from '@root/i18n/en/_all'
import it from '@root/i18n/it/_all'
import ko from '@root/i18n/ko/_all'
import pt_BR from '@root/i18n/pt_BR/_all'
import vi from '@root/i18n/vi/_all'
import zh_Hans from '@root/i18n/zh-Hans/_all'

import '@formatjs/intl-getcanonicallocales/polyfill'
import '@formatjs/intl-locale/polyfill'

import '@formatjs/intl-pluralrules/polyfill'
import '@formatjs/intl-pluralrules/locale-data/de'
import '@formatjs/intl-pluralrules/locale-data/en'
import '@formatjs/intl-pluralrules/locale-data/it'
import '@formatjs/intl-pluralrules/locale-data/ko'
import '@formatjs/intl-pluralrules/locale-data/pt'
import '@formatjs/intl-pluralrules/locale-data/vi'
import '@formatjs/intl-pluralrules/locale-data/zh'

import '@formatjs/intl-numberformat/polyfill'
import '@formatjs/intl-numberformat/locale-data/de'
import '@formatjs/intl-numberformat/locale-data/en'
import '@formatjs/intl-numberformat/locale-data/it'
import '@formatjs/intl-numberformat/locale-data/ko'
import '@formatjs/intl-numberformat/locale-data/pt'
import '@formatjs/intl-numberformat/locale-data/vi'
import '@formatjs/intl-numberformat/locale-data/zh-Hans'

import '@formatjs/intl-datetimeformat/polyfill'
import '@formatjs/intl-datetimeformat/locale-data/de'
import '@formatjs/intl-datetimeformat/locale-data/en'
import '@formatjs/intl-datetimeformat/locale-data/it'
import '@formatjs/intl-datetimeformat/locale-data/ko'
import '@formatjs/intl-datetimeformat/locale-data/pt'
import '@formatjs/intl-datetimeformat/locale-data/vi'
import '@formatjs/intl-datetimeformat/locale-data/zh-Hans'
import '@formatjs/intl-datetimeformat/add-all-tz'

import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/locale-data/de'
import '@formatjs/intl-relativetimeformat/locale-data/en'
import '@formatjs/intl-relativetimeformat/locale-data/it'
import '@formatjs/intl-relativetimeformat/locale-data/ko'
import '@formatjs/intl-relativetimeformat/locale-data/pt'
import '@formatjs/intl-relativetimeformat/locale-data/vi'
import '@formatjs/intl-relativetimeformat/locale-data/zh-Hans'

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',

  ns: ['common'],
  defaultNS: 'common',

  resources: { 'zh-Hans': zh_Hans, vi, 'pt-BR': pt_BR, ko, it, en, de },
  returnEmptyString: false,

  saveMissing: true,
  missingKeyHandler: (_, ns, key) => {
    console.log('i18n missing', ns, key)
  },

  interpolation: {
    escapeValue: false
  },
  react: {
    useSuspense: false
  }
})

export default i18n
