import { store } from '@root/store'

const relativeTime = (date: string) => {
  const units = {
    year: 24 * 60 * 60 * 1000 * 365,
    month: (24 * 60 * 60 * 1000 * 365) / 12,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000
  }

  const rtf = new Intl.RelativeTimeFormat(store.getState().settings.language, {
    numeric: 'auto'
  })

  const elapsed = +new Date(date) - +new Date()

  // "Math.abs" accounts for both "past" & "future" scenarios
  for (const u in units) {
    // @ts-ignore
    if (Math.abs(elapsed) > units[u] || u == 'second') {
      // @ts-ignore
      return rtf.format(Math.round(elapsed / units[u]), u)
    }
  }
}

export default relativeTime
