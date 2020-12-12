import React, { useState } from 'react'
import { Pressable, Text } from 'react-native'
import Collapsible from 'react-native-collapsible'

import ParseContent from 'src/components/ParseContent'

import { useTheme } from 'src/utils/styles/ThemeManager'
import { StyleConstants } from 'src/utils/styles/constants'
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
  const { theme } = useTheme()
  const [spoilerCollapsed, setSpoilerCollapsed] = useState(true)
  const lineHeight = 28

  return (
    <>
      {status.spoiler_text ? (
        <>
          <ParseContent
            content={status.spoiler_text}
            size={highlighted ? 'L' : 'M'}
            emojis={status.emojis}
          />
          <Collapsible collapsed={spoilerCollapsed} collapsedHeight={20}>
            <ParseContent
              content={status.content}
              size={highlighted ? 'L' : 'M'}
              emojis={status.emojis}
              mentions={status.mentions}
              {...(numberOfLines && { numberOfLines: numberOfLines })}
            />
          </Collapsible>
          <Pressable
            onPress={() => setSpoilerCollapsed(!spoilerCollapsed)}
            style={{
              marginTop: spoilerCollapsed ? -lineHeight : 0
            }}
          >
            <LinearGradient
              colors={[
                theme.backgroundGradientStart,
                theme.backgroundGradientEnd
              ]}
              locations={[0, lineHeight / (StyleConstants.Font.Size.S * 5)]}
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
