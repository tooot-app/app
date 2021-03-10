import { getSettingsFontsize } from '@utils/slices/settingsSlice'
import { adaptiveScale, StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useMemo } from 'react'
import { StyleSheet, Text } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useSelector } from 'react-redux'

const regexEmoji = new RegExp(/(:[A-Za-z0-9_]+:)/)

export interface Props {
  content: string
  emojis?: Mastodon.Emoji[]
  size?: 'S' | 'M' | 'L'
  adaptiveSize?: boolean
  fontBold?: boolean
}

const ParseEmojis = React.memo(
  ({
    content,
    emojis,
    size = 'M',
    adaptiveSize = false,
    fontBold = false
  }: Props) => {
    const adaptiveFontsize = useSelector(getSettingsFontsize)
    const adaptedFontsize = adaptiveScale(
      StyleConstants.Font.Size[size],
      adaptiveSize ? adaptiveFontsize : 0
    )
    const adaptedLineheight = adaptiveScale(
      StyleConstants.Font.LineHeight[size],
      adaptiveSize ? adaptiveFontsize : 0
    )

    const { mode, theme } = useTheme()
    const styles = useMemo(() => {
      return StyleSheet.create({
        text: {
          color: theme.primary,
          fontSize: adaptedFontsize,
          lineHeight: adaptedLineheight,
          ...(fontBold && { fontWeight: StyleConstants.Font.Weight.Bold })
        },
        image: {
          width: adaptedFontsize,
          height: adaptedFontsize,
          transform: [{ translateY: -2 }]
        }
      })
    }, [mode, adaptiveFontsize])

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
                    <FastImage
                      key={adaptiveFontsize}
                      source={{ uri: emojis[emojiIndex].url }}
                      style={styles.image}
                    />
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
  },
  (prev, next) => prev.content === next.content
)

export default ParseEmojis
