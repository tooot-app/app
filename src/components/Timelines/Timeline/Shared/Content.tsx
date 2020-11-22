import React, { useState } from 'react'
import { Text } from 'react-native'
import Collapsible from 'react-native-collapsible'

import ParseContent from 'src/components/ParseContent'

import constants from 'src/utils/styles/constants'
import { useTheme } from 'src/utils/styles/ThemeManager'

export interface Props {
  content: string
  emojis: Mastodon.Emoji[]
  mentions: Mastodon.Mention[]
  spoiler_text?: string
}

const Content: React.FC<Props> = ({
  content,
  emojis,
  mentions,
  spoiler_text
}) => {
  const { theme } = useTheme()
  const [spoilerCollapsed, setSpoilerCollapsed] = useState(true)

  return (
    <>
      {content &&
        (spoiler_text ? (
          <>
            <Text>
              {spoiler_text}{' '}
              <Text
                onPress={() => setSpoilerCollapsed(!spoilerCollapsed)}
                style={{ color: theme.link }}
              >
                {spoilerCollapsed ? '点击展开' : '点击收起'}
              </Text>
            </Text>
            <Collapsible collapsed={spoilerCollapsed}>
              <ParseContent
                content={content}
                size={constants.FONT_SIZE_M}
                emojis={emojis}
                mentions={mentions}
              />
            </Collapsible>
          </>
        ) : (
          <ParseContent
            content={content}
            size={constants.FONT_SIZE_M}
            emojis={emojis}
            mentions={mentions}
          />
        ))}
    </>
  )
}

export default Content
