import React from 'react'
import PropTypes from 'prop-types'
import { Image, Text } from 'react-native'

const regexEmoji = new RegExp(/(:[a-z0-9_]+:)/g)
const regexEmojiSelect = new RegExp(/:([a-z0-9_]+):/)

export default function Emojis ({ content, emojis, dimension }) {
  const hasEmojis = content.match(regexEmoji)
  return hasEmojis ? (
    content.split(regexEmoji).map((str, i) => {
      if (str.match(regexEmoji)) {
        const emojiShortcode = str.split(regexEmojiSelect)[1]
        const emojiIndex = emojis.findIndex(emoji => {
          return emoji.shortcode === emojiShortcode
        })
        return (
          <Image
            key={i}
            source={{ uri: emojis[emojiIndex].url }}
            style={{ width: dimension, height: dimension }}
          />
        )
      } else {
        return (
          <Text
            key={i}
            style={{ fontSize: dimension, lineHeight: dimension + 1 }}
          >
            {str}
          </Text>
        )
      }
    })
  ) : (
    <Text style={{ fontSize: dimension, lineHeight: dimension + 1 }}>
      {content}
    </Text>
  )
}

Emojis.propTypes = {
  content: PropTypes.string.isRequired,
  emojis: PropTypes.arrayOf(
    PropTypes.exact({
      shortcode: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      static_url: PropTypes.string.isRequired,
      visible_in_picker: PropTypes.bool.isRequired,
      category: PropTypes.string
    })
  )
}
