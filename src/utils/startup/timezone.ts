import * as Localization from 'expo-localization'
import log from './log'

const timezone = () => {
  log('log', 'Timezone', Localization.getCalendars()[0].timeZone || 'unknown')
  if ('__setDefaultTimeZone' in Intl.DateTimeFormat) {
    try {
      // @ts-ignore
      Intl.DateTimeFormat.__setDefaultTimeZone(Intl.DateTimeFormat.__setDefaultTimeZone('xxx'))
    } catch {}
  }
}

export default timezone
