import PropTypes from 'prop-types'

const propTypesCard = PropTypes.shape({
  // Base
  url: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['link', 'photo', 'video', 'rich']).isRequired,

  // Attributes
  author_name: PropTypes.string,
  author_url: PropTypes.string,
  provider_name: PropTypes.string,
  provider_url: PropTypes.string,
  html: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  image: PropTypes.string,
  embed_url: PropTypes.string,
  blurhash: PropTypes.string
})

export default propTypesCard
