import PropTypes from 'prop-types'

const propTypesMention = PropTypes.shape({
  // Base
  id: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  acct: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired
})

export default propTypesMention
