import PropTypes from 'prop-types'

export default function relativeTime (date) {
  var units = {
    year: 24 * 60 * 60 * 1000 * 365,
    month: (24 * 60 * 60 * 1000 * 365) / 12,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000
  }

  var rtf = new Intl.RelativeTimeFormat('zh', { numeric: 'auto' })

  var elapsed = new Date(date) - new Date()

  // "Math.abs" accounts for both "past" & "future" scenarios
  for (var u in units)
    if (Math.abs(elapsed) > units[u] || u == 'second')
      return rtf.format(Math.round(elapsed / units[u]), u)
}

relativeTime.propTypes = {
  date: PropTypes.string.isRequired
}
