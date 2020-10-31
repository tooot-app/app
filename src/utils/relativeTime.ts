const relativeTime = (date: string) => {
  let units = {
    year: 24 * 60 * 60 * 1000 * 365,
    month: (24 * 60 * 60 * 1000 * 365) / 12,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000
  }

  let rtf = new Intl.RelativeTimeFormat('zh', { numeric: 'auto' })

  let elapsed: number = new Date(date) - new Date()

  // "Math.abs" accounts for both "past" & "future" scenarios
  for (var u in units)
    if (Math.abs(elapsed) > units[u] || u == 'second')
      return rtf.format(Math.round(elapsed / units[u]), u)
}

export default relativeTime
