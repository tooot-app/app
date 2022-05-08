import CustomText from '@components/Text'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { getSettingsFontsize } from '@utils/slices/settingsSlice'
import { StyleConstants } from '@utils/styles/constants'
import { adaptiveScale } from '@utils/styles/scaling'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useMemo } from 'react'
import { StyleSheet } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useSelector } from 'react-redux'
import validUrl from 'valid-url'

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
    const { reduceMotionEnabled } = useAccessibility()

    const adaptiveFontsize = useSelector(getSettingsFontsize)
    const adaptedFontsize = adaptiveScale(
      StyleConstants.Font.Size[size],
      adaptiveSize ? adaptiveFontsize : 0
    )
    const adaptedLineheight = adaptiveScale(
      StyleConstants.Font.LineHeight[size],
      adaptiveSize ? adaptiveFontsize : 0
    )

    const { colors, theme } = useTheme()
    const styles = useMemo(() => {
      return StyleSheet.create({
        text: {
          color: colors.primaryDefault,
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
    }, [theme, adaptiveFontsize])

    return (
      <CustomText style={styles.text}>
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
                if (emojiIndex === -1) {
                  return (
                    <CustomText key={emojiShortcode + i}>
                      {emojiShortcode}
                    </CustomText>
                  )
                } else {
                  const uri = reduceMotionEnabled
                    ? emojis[emojiIndex].static_url
                    : emojis[emojiIndex].url
                  if (validUrl.isHttpsUri(uri)) {
                    return (
                      <CustomText key={emojiShortcode + i}>
                        {i === 0 ? ' ' : undefined}
                        <FastImage source={{ uri }} style={styles.image} />
                      </CustomText>
                    )
                  } else {
                    return null
                  }
                }
              } else {
                return <CustomText key={i}>{str}</CustomText>
              }
            })
        ) : (
          <CustomText>{content}</CustomText>
        )}
      </CustomText>
    )
  },
  (prev, next) => prev.content === next.content
)

export default ParseEmojis
