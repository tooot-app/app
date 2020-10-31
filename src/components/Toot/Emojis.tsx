import React from 'react'
import { Image, Text } from 'react-native'

const regexEmoji = new RegExp(/(:[a-z0-9_]+:)/)

export interface Props {
  content: string
  emojis: mastodon.Emoji[]
  dimension: number
}

const Emojis: React.FC<Props> = ({ content, emojis, dimension }) => {
  const hasEmojis = content.match(regexEmoji)
  return hasEmojis ? (
    <>
      {content.split(regexEmoji).map((str, i) => {
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
      })}
    </>
  ) : (
    <Text style={{ fontSize: dimension, lineHeight: dimension + 1 }}>
      {content}
    </Text>
  )
}

export default Emojis
