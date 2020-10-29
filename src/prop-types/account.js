import PropTypes from 'prop-types'
import propTypesEmoji from './emoji'
import propTypesStatus from './status'

const propTypesAccount = PropTypes.shape({
  // Base
  id: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  acct: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,

  // Attributes
  display_name: PropTypes.string.isRequired,
  note: PropTypes.string,
  avatar: PropTypes.string.isRequired,
  avatar_static: PropTypes.string.isRequired,
  header: PropTypes.string.isRequired,
  header_static: PropTypes.string.isRequired,
  locked: PropTypes.bool.isRequired,
  emojis: PropTypes.arrayOf(propTypesEmoji),
  discoverable: PropTypes.bool.isRequired,

  // Statistics
  created_at: PropTypes.string.isRequired,
  last_status_at: PropTypes.string.isRequired,
  statuses_count: PropTypes.number.isRequired,
  followers_count: PropTypes.number.isRequired,
  following_count: PropTypes.number.isRequired,

  // Others
  moved: propTypesStatus,
  // fields prop-types
  bot: PropTypes.bool.isRequired
  // source prop-types
})

export default propTypesAccount
