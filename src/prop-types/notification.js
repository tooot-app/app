import PropTypes from 'prop-types'
import propTypesAccount from './account'
import propTypesStatus from './status'

const propTypesNotification = PropTypes.shape({
  // Base
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['follow', 'mention', 'reblog', 'favourite', 'poll'])
    .isRequired,
  created_at: PropTypes.string.isRequired,
  account: propTypesAccount,

  // Others
  status: propTypesStatus
})

export default propTypesNotification
