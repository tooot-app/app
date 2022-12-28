import * as Localization from 'expo-localization'
import log from './log'

const timezone = () => {
  log('log', 'Timezone', Localization.getCalendars()[0].timeZone || 'unknown')
  if ('__setDefaultTimeZone' in Intl.DateTimeFormat) {
    // @ts-ignore
    Intl.DateTimeFormat.__setDefaultTimeZone(Localization.getCalendars()[0].timeZone)
  }
}

export default timezone
