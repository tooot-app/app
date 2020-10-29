import PropTypes from 'prop-types'
import propTypesAccount from './account'
import propTypesAttachment from './attachment'
import propTypesApplication from './application'
import propTypesMention from './mention'
import propTypesTag from './tag'
import propTypesEmoji from './emoji'
import propTypesPoll from './poll'
import propTypesCard from './card'

const propTypesStatus = PropTypes.shape({
  // Base
  id: PropTypes.string.isRequired,
  uri: PropTypes.string.isRequired,
  created_at: PropTypes.string.isRequired,
  account: propTypesAccount,
  content: PropTypes.string.isRequired, // Might not be required
  visibility: PropTypes.oneOf(['public', 'unlisted', 'private', 'direct'])
    .isRequired,
  sensitive: PropTypes.bool.isRequired,
  spoiler_text: PropTypes.string,
  media_attachments: PropTypes.arrayOf(propTypesAttachment),
  application: propTypesApplication,

  // Attributes
  mentions: PropTypes.arrayOf(propTypesMention),
  tags: PropTypes.arrayOf(propTypesTag),
  emojis: PropTypes.arrayOf(propTypesEmoji),

  // Interaction
  reblogs_count: PropTypes.number.isRequired,
  favourites_count: PropTypes.number.isRequired,
  replies_count: PropTypes.number.isRequired,
  favourited: PropTypes.bool,
  reblogged: PropTypes.bool,
  muted: PropTypes.bool,
  bookmarked: PropTypes.bool,
  pinned: PropTypes.bool,

  // Others
  url: PropTypes.string,
  in_reply_to_id: PropTypes.string,
  in_reply_to_account_id: PropTypes.string,
  reblog: propTypesStatus,
  poll: propTypesPoll,
  card: propTypesCard,
  language: PropTypes.string,
  text: PropTypes.string
})

export default propTypesStatus
