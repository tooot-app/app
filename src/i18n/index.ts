import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ca from './ca'
import de from './de'
import en from './en'
import es from './es'
import fr from './fr'
import it from './it'
import ja from './ja'
import ko from './ko'
import nl from './nl'
import pt_BR from './pt_BR'
import sv from './sv'
import uk from './uk'
import vi from './vi'
import zh_Hans from './zh-Hans'
import zh_Hant from './zh-Hant'

import '@formatjs/intl-getcanonicallocales/polyfill'
import '@formatjs/intl-locale/polyfill'

import '@formatjs/intl-pluralrules/polyfill'
import '@formatjs/intl-pluralrules/locale-data/ca'
import '@formatjs/intl-pluralrules/locale-data/de'
import '@formatjs/intl-pluralrules/locale-data/en'
import '@formatjs/intl-pluralrules/locale-data/es'
import '@formatjs/intl-pluralrules/locale-data/fr'
import '@formatjs/intl-pluralrules/locale-data/it'
import '@formatjs/intl-pluralrules/locale-data/ja'
import '@formatjs/intl-pluralrules/locale-data/ko'
import '@formatjs/intl-pluralrules/locale-data/nl'
import '@formatjs/intl-pluralrules/locale-data/pt'
import '@formatjs/intl-pluralrules/locale-data/sv'
import '@formatjs/intl-pluralrules/locale-data/uk'
import '@formatjs/intl-pluralrules/locale-data/vi'
import '@formatjs/intl-pluralrules/locale-data/zh'

import '@formatjs/intl-numberformat/polyfill'
import '@formatjs/intl-numberformat/locale-data/ca'
import '@formatjs/intl-numberformat/locale-data/de'
import '@formatjs/intl-numberformat/locale-data/en'
import '@formatjs/intl-numberformat/locale-data/es'
import '@formatjs/intl-numberformat/locale-data/fr'
import '@formatjs/intl-numberformat/locale-data/it'
import '@formatjs/intl-numberformat/locale-data/ja'
import '@formatjs/intl-numberformat/locale-data/ko'
import '@formatjs/intl-numberformat/locale-data/nl'
import '@formatjs/intl-numberformat/locale-data/pt'
import '@formatjs/intl-numberformat/locale-data/sv'
import '@formatjs/intl-numberformat/locale-data/uk'
import '@formatjs/intl-numberformat/locale-data/vi'
import '@formatjs/intl-numberformat/locale-data/zh-Hans'
import '@formatjs/intl-numberformat/locale-data/zh-Hant'

import '@formatjs/intl-datetimeformat/polyfill'
import '@formatjs/intl-datetimeformat/add-all-tz'
import '@formatjs/intl-datetimeformat/locale-data/ca'
import '@formatjs/intl-datetimeformat/locale-data/de'
import '@formatjs/intl-datetimeformat/locale-data/en'
import '@formatjs/intl-datetimeformat/locale-data/es'
import '@formatjs/intl-datetimeformat/locale-data/fr'
import '@formatjs/intl-datetimeformat/locale-data/it'
import '@formatjs/intl-datetimeformat/locale-data/ja'
import '@formatjs/intl-datetimeformat/locale-data/ko'
import '@formatjs/intl-datetimeformat/locale-data/nl'
import '@formatjs/intl-datetimeformat/locale-data/pt'
import '@formatjs/intl-datetimeformat/locale-data/sv'
import '@formatjs/intl-datetimeformat/locale-data/uk'
import '@formatjs/intl-datetimeformat/locale-data/vi'
import '@formatjs/intl-datetimeformat/locale-data/zh-Hans'
import '@formatjs/intl-datetimeformat/locale-data/zh-Hant'

import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/locale-data/ca'
import '@formatjs/intl-relativetimeformat/locale-data/de'
import '@formatjs/intl-relativetimeformat/locale-data/en'
import '@formatjs/intl-relativetimeformat/locale-data/es'
import '@formatjs/intl-relativetimeformat/locale-data/fr'
import '@formatjs/intl-relativetimeformat/locale-data/it'
import '@formatjs/intl-relativetimeformat/locale-data/ja'
import '@formatjs/intl-relativetimeformat/locale-data/ko'
import '@formatjs/intl-relativetimeformat/locale-data/nl'
import '@formatjs/intl-relativetimeformat/locale-data/pt'
import '@formatjs/intl-relativetimeformat/locale-data/sv'
import '@formatjs/intl-relativetimeformat/locale-data/uk'
import '@formatjs/intl-relativetimeformat/locale-data/vi'
import '@formatjs/intl-relativetimeformat/locale-data/zh-Hans'
import '@formatjs/intl-relativetimeformat/locale-data/zh-Hant'

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',

  ns: ['common'],
  defaultNS: 'common',

  resources: {
    ca,
    de,
    en,
    es,
    fr,
    it,
    ja,
    ko,
    nl,
    'pt-BR': pt_BR,
    sv,
    uk,
    vi,
    'zh-Hans': zh_Hans,
    'zh-Hant': zh_Hant
  },
  returnNull: false,
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
