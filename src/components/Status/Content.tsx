import React, { useState } from 'react'
import { Text } from 'react-native'
import Collapsible from 'react-native-collapsible'

import ParseContent from 'src/components/ParseContent'

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
  const [spoilerCollapsed, setSpoilerCollapsed] = useState(true)

  return (
    <>
      {content &&
        (spoiler_text ? (
          <>
            <Text>
              {spoiler_text}{' '}
              <Text onPress={() => setSpoilerCollapsed(!spoilerCollapsed)}>
                点击展开
              </Text>
            </Text>
            <Collapsible collapsed={spoilerCollapsed}>
              <ParseContent
                content={content}
                emojis={emojis}
                emojiSize={14}
                mentions={mentions}
              />
            </Collapsible>
          </>
        ) : (
          <ParseContent
            content={content}
            emojis={emojis}
            emojiSize={14}
            mentions={mentions}
          />
        ))}
    </>
  )
}

export default Content
