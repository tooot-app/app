import PropTypes from 'prop-types'

const propTypesApplication = PropTypes.shape({
  // Base
  name: PropTypes.string.isRequired,
  website: PropTypes.string,
  vapid_key: PropTypes.string
})

export default propTypesApplication
