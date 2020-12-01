import React, { useState } from 'react'
import { Text } from 'react-native'
import Collapsible from 'react-native-collapsible'

import ParseContent from 'src/components/ParseContent'

import { useTheme } from 'src/utils/styles/ThemeManager'
import { StyleConstants } from 'src/utils/styles/constants'

export interface Props {
  content: string
  emojis: Mastodon.Emoji[]
  mentions: Mastodon.Mention[]
  spoiler_text?: string
  numberOfLines?: number
}

const Content: React.FC<Props> = ({
  content,
  emojis,
  mentions,
  spoiler_text,
  numberOfLines
}) => {
  const { theme } = useTheme()
  const [spoilerCollapsed, setSpoilerCollapsed] = useState(true)

  return (
    <>
      {content &&
        (spoiler_text ? (
          <>
            <Text style={{ fontSize: StyleConstants.Font.Size.M }}>
              {spoiler_text}{' '}
              <Text
                onPress={() => setSpoilerCollapsed(!spoilerCollapsed)}
                style={{
                  color: theme.link
                }}
              >
                {spoilerCollapsed ? '点击展开' : '点击收起'}
              </Text>
            </Text>
            <Collapsible collapsed={spoilerCollapsed}>
              <ParseContent
                content={content}
                size={StyleConstants.Font.Size.M}
                emojis={emojis}
                mentions={mentions}
                {...(numberOfLines && { numberOfLines: numberOfLines })}
              />
            </Collapsible>
          </>
        ) : (
          <ParseContent
            content={content}
            size={StyleConstants.Font.Size.M}
            emojis={emojis}
            mentions={mentions}
            {...(numberOfLines && { numberOfLines: numberOfLines })}
          />
        ))}
    </>
  )
}

export default Content
