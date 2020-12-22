import React, { useState } from 'react'
import { LayoutAnimation, Pressable, Text, View } from 'react-native'
import ParseContent from '@components/ParseContent'
import { useTheme } from '@utils/styles/ThemeManager'
import { StyleConstants } from '@utils/styles/constants'
import { LinearGradient } from 'expo-linear-gradient'

export interface Props {
  status: Mastodon.Status
  numberOfLines?: number
  highlighted?: boolean
}

const TimelineContent: React.FC<Props> = ({
  status,
  numberOfLines,
  highlighted = false
}) => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  const { theme } = useTheme()
  const [spoilerCollapsed, setSpoilerCollapsed] = useState(false)
  const lineHeight = 28

  return (
    <>
      {status.spoiler_text ? (
        <>
          <ParseContent
            content={status.spoiler_text}
            size={highlighted ? 'L' : 'M'}
            emojis={status.emojis}
            numberOfLines={999}
          />
          <View
            style={{
              flex: 1,
              height: spoilerCollapsed ? StyleConstants.Font.Size.M : undefined,
              marginTop: StyleConstants.Font.Size.M
            }}
          >
            <ParseContent
              content={status.content}
              size={highlighted ? 'L' : 'M'}
              emojis={status.emojis}
              mentions={status.mentions}
              numberOfLines={999}
            />
          </View>
          <Pressable
            onPress={() => setSpoilerCollapsed(!spoilerCollapsed)}
            style={{
              marginTop: spoilerCollapsed ? -lineHeight : 0
            }}
          >
            <LinearGradient
              {...(spoilerCollapsed
                ? {
                    colors: [
                      theme.backgroundGradientStart,
                      theme.backgroundGradientEnd
                    ],
                    locations: [
                      0,
                      lineHeight / (StyleConstants.Font.Size.S * 4)
                    ]
                  }
                : {
                    colors: ['rgba(0, 0, 0, 0)']
                  })}
              style={{
                paddingTop: StyleConstants.Font.Size.S * 2,
                paddingBottom: StyleConstants.Font.Size.S
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: StyleConstants.Font.Size.S,
                  color: theme.primary
                }}
              >
                {spoilerCollapsed ? '展开' : '收起'}隐藏内容
              </Text>
            </LinearGradient>
          </Pressable>
        </>
      ) : (
        <ParseContent
          content={status.content}
          size={highlighted ? 'L' : 'M'}
          emojis={status.emojis}
          mentions={status.mentions}
          {...(numberOfLines && { numberOfLines: numberOfLines })}
        />
      )}
    </>
  )
}

export default React.memo(TimelineContent, () => true)
