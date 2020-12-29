import React from 'react'
import { Image, StyleSheet, Text } from 'react-native'
import { useTheme } from '@utils/styles/ThemeManager'
import { StyleConstants } from '@utils/styles/constants'

const regexEmoji = new RegExp(/(:[A-Za-z0-9_]+:)/)

export interface Props {
  content: string
  emojis: Mastodon.Emoji[]
  size?: 'S' | 'M' | 'L'
  fontBold?: boolean
  numberOfLines?: number
}

const Emojis: React.FC<Props> = ({
  content,
  emojis,
  size = 'M',
  fontBold = false,
  numberOfLines
}) => {
  const { theme } = useTheme()
  const styles = StyleSheet.create({
    text: {
      color: theme.primary,
      ...StyleConstants.FontStyle[size],
      ...(fontBold && { fontWeight: StyleConstants.Font.Weight.Bold })
    },
    image: {
      width: StyleConstants.Font.Size[size],
      height: StyleConstants.Font.Size[size],
      marginBottom: -2 // hacking
    }
  })

  return (
    <Text numberOfLines={numberOfLines || undefined}>
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
              resizeMode='contain'
              source={{ uri: emojis[emojiIndex].url }}
              style={[styles.image]}
            />
          )
        } else {
          return str ? (
            <Text key={i} style={styles.text}>
              {str}
            </Text>
          ) : (
            undefined
          )
        }
      })}
    </Text>
  )
}

// export default React.memo(Emojis, () => true)
export default Emojis
