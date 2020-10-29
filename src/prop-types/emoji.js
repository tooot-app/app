import PropTypes from 'prop-types'

const propTypesEmoji = PropTypes.shape({
  // Base
  shortcode: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  static_url: PropTypes.string.isRequired,
  visible_in_picker: PropTypes.bool.isRequired,
  category: PropTypes.string
})

export default propTypesEmoji
