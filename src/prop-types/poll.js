import PropTypes from 'prop-types'
import propTypesEmoji from './emoji'

const propTypesPoll = PropTypes.shape({
  // Base
  id: PropTypes.string.isRequired,
  expires_at: PropTypes.string.isRequired,
  expired: PropTypes.bool.isRequired,
  multiple: PropTypes.bool.isRequired,
  votes_count: PropTypes.number.isRequired,
  voters_count: PropTypes.number.isRequired,
  voted: PropTypes.bool,
  own_votes: PropTypes.arrayOf(PropTypes.number),
  options: PropTypes.arrayOf(
    PropTypes.exact({
      title: PropTypes.string.isRequired,
      votes_count: PropTypes.number.isRequired
    })
  ).isRequired,
  emojis: PropTypes.arrayOf(propTypesEmoji)
})

export default propTypesPoll
