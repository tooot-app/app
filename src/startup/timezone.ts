import * as Localization from 'expo-localization'
import log from './log'

const timezone = () => {
  log('log', 'Timezone', Localization.timezone)
  if ('__setDefaultTimeZone' in Intl.DateTimeFormat) {
    // @ts-ignore
    Intl.DateTimeFormat.__setDefaultTimeZone(Localization.timezone)
  }
}

export default timezone
