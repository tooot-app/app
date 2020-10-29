import React from 'react'
import PropTypes from 'prop-types'
import propTypesEmoji from 'src/prop-types/emoji'
import { Image, Text } from 'react-native'

const regexEmoji = new RegExp(/(:[a-z0-9_]+:)/)

export default function Emojis ({ content, emojis, dimension }) {
  const hasEmojis = content.match(regexEmoji)
  return hasEmojis ? (
    content.split(regexEmoji).map((str, i) => {
      if (str.match(regexEmoji)) {
        const emojiShortcode = str.split(regexEmoji)[1]
        const emojiIndex = emojis.findIndex(emoji => {
          return emojiShortcode === `:${emoji.shortcode}:`
        })
        return emojiIndex === -1 ? (
          <Text key={i} style={{ color: 'red' }}>
            Something wrong with emoji!
          </Text>
        ) : (
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
  emojis: PropTypes.arrayOf(propTypesEmoji)
}
