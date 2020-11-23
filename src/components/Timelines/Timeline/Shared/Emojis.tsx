import React from 'react'
import { Image, StyleSheet, Text } from 'react-native'
import { useTheme } from 'src/utils/styles/ThemeManager'

import constants from 'src/utils/styles/constants'

const regexEmoji = new RegExp(/(:[a-z0-9_]+:)/)

export interface Props {
  content: string
  emojis: Mastodon.Emoji[]
  size: number
  fontBold?: boolean
}

const Emojis: React.FC<Props> = ({
  content,
  emojis,
  size,
  fontBold = false
}) => {
  const { theme } = useTheme()
  const styles = StyleSheet.create({
    text: {
      fontSize: size,
      lineHeight: size + 2,
      color: theme.primary,
      ...(fontBold && { fontWeight: constants.FONT_WEIGHT_BOLD })
    },
    image: {
      width: size,
      height: size
    }
  })
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
            <Text key={i} style={styles.text}>
              {emojiShortcode}
            </Text>
          ) : (
            <Image
              key={i}
              source={{ uri: emojis[emojiIndex].url }}
              style={styles.image}
            />
          )
        } else {
          return (
            <Text key={i} style={styles.text}>
              {str}
            </Text>
          )
        }
      })}
    </>
  ) : (
    <Text style={styles.text}>{content}</Text>
  )
}

export default Emojis
