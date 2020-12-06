import React, { useState } from 'react'
import { Text } from 'react-native'
import Collapsible from 'react-native-collapsible'

import ParseContent from 'src/components/ParseContent'

import { useTheme } from 'src/utils/styles/ThemeManager'
import { StyleConstants } from 'src/utils/styles/constants'

export interface Props {
  status: Mastodon.Status
  numberOfLines?: number
}

const TimelineContent: React.FC<Props> = ({ status, numberOfLines }) => {
  const { theme } = useTheme()
  const [spoilerCollapsed, setSpoilerCollapsed] = useState(true)

  return (
    <>
      {status.spoiler_text ? (
        <>
          <Text style={{ fontSize: StyleConstants.Font.Size.M }}>
            <ParseContent
              content={status.spoiler_text}
              size={StyleConstants.Font.Size.M}
              emojis={status.emojis}
            />{' '}
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
              content={status.content}
              size={StyleConstants.Font.Size.M}
              emojis={status.emojis}
              mentions={status.mentions}
              {...(numberOfLines && { numberOfLines: numberOfLines })}
            />
          </Collapsible>
        </>
      ) : (
        <ParseContent
          content={status.content}
          size={StyleConstants.Font.Size.M}
          emojis={status.emojis}
          mentions={status.mentions}
          {...(numberOfLines && { numberOfLines: numberOfLines })}
        />
      )}
    </>
  )
}

export default React.memo(TimelineContent, () => true)
