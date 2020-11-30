import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { useTheme } from 'src/utils/styles/ThemeManager'
import { StyleConstants } from 'src/utils/styles/constants'

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
      color: theme.primary,
      ...(fontBold && { fontWeight: StyleConstants.Font.Weight.Bold })
    },
    image: {
      width: size,
      height: size,
      paddingTop: 1,
      marginBottom: -1
    }
  })
  const hasEmojis = content.match(regexEmoji)

  return (
    <Text>
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
            <View key={i} style={styles.image}>
              <Image
                key={i}
                resizeMode='contain'
                source={{ uri: emojis[emojiIndex].url }}
                style={{ width: '100%', height: '100%' }}
              />
            </View>
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

export default Emojis
