import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Text } from 'react-native'
import Collapsible from 'react-native-collapsible'

import ParseContent from 'src/components/ParseContent'

export default function Content ({ content, emojis, mentions, spoiler_text }) {
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

Content.propTypes = {
  content: ParseContent.propTypes.content,
  emojis: ParseContent.propTypes.emojis,
  mentions: ParseContent.propTypes.mentions,
  spoiler_text: PropTypes.string
}
