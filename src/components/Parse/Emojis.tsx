import CustomText from '@components/Text'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { getSettingsFontsize } from '@utils/slices/settingsSlice'
import { StyleConstants } from '@utils/styles/constants'
import { adaptiveScale } from '@utils/styles/scaling'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Platform, TextStyle } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useSelector } from 'react-redux'
import validUrl from 'valid-url'

const regexEmoji = new RegExp(/(:[A-Za-z0-9_]+:)/)

export interface Props {
  content?: string
  emojis?: Mastodon.Emoji[]
  size?: 'S' | 'M' | 'L'
  adaptiveSize?: boolean
  fontBold?: boolean
  style?: TextStyle
}

const ParseEmojis = React.memo(
  ({ content, emojis, size = 'M', adaptiveSize = false, fontBold = false, style }: Props) => {
    if (!content) return null

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

    return (
      <CustomText
        style={[
          {
            color: colors.primaryDefault,
            fontSize: adaptedFontsize,
            lineHeight: adaptedLineheight
          },
          style
        ]}
        fontWeight={fontBold ? 'Bold' : undefined}
      >
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
                  return <CustomText key={emojiShortcode + i}>{emojiShortcode}</CustomText>
                } else {
                  const uri = reduceMotionEnabled
                    ? emojis[emojiIndex].static_url
                    : emojis[emojiIndex].url
                  if (validUrl.isHttpsUri(uri)) {
                    return (
                      <CustomText key={emojiShortcode + i}>
                        {i === 0 ? ' ' : undefined}
                        <FastImage
                          source={{ uri }}
                          style={{
                            width: adaptedFontsize,
                            height: adaptedFontsize,
                            transform: [{ translateY: Platform.OS === 'ios' ? -1 : 2 }]
                          }}
                        />
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
  (prev, next) => prev.content === next.content && prev.style?.color === next.style?.color
)

export default ParseEmojis
