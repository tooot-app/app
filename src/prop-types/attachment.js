import PropTypes from 'prop-types'

const propTypesAttachment = PropTypes.shape({
  // Base
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['unknown', 'image', 'gifv', 'video', 'audio'])
    .isRequired,
  url: PropTypes.string.isRequired,
  preview_url: PropTypes.string,

  // Others
  remote_url: PropTypes.string,
  text_url: PropTypes.string,
  meta: PropTypes.object,
  description: PropTypes.string,
  blurhash: PropTypes.string
})

export default propTypesAttachment
