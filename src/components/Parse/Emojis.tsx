import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { StyleSheet, Text } from 'react-native'
import { Image } from 'react-native-expo-image-cache'

const regexEmoji = new RegExp(/(:[A-Za-z0-9_]+:)/)

export interface Props {
  content: string
  emojis?: Mastodon.Emoji[]
  size?: 'S' | 'M' | 'L'
  fontBold?: boolean
}

const ParseEmojis: React.FC<Props> = ({
  content,
  emojis,
  size = 'M',
  fontBold = false
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
      height: StyleConstants.Font.Size[size]
    }
  })

  return (
    <Text style={styles.text}>
      {emojis ? (
        content
          .split(regexEmoji)
          .filter(f => f)
          .map((str, i) => {
            if (str.match(regexEmoji)) {
              const emojiShortcode = str.split(regexEmoji)[1]
              const emojiIndex = emojis.findIndex(emoji => {
                return emojiShortcode === `:${emoji.shortcode}:`
              })
              return emojiIndex === -1 ? (
                <Text key={i}>{emojiShortcode}</Text>
              ) : (
                <Text key={i}>
                  {/* When emoji starts a paragraph, lineHeight will break */}
                  {i === 0 ? <Text> </Text> : null}
                  <Image uri={emojis[emojiIndex].url} style={[styles.image]} />
                </Text>
              )
            } else {
              return <Text key={i}>{str}</Text>
            }
          })
      ) : (
        <Text>{content}</Text>
      )}
    </Text>
  )
}

export default React.memo(ParseEmojis, () => true)
