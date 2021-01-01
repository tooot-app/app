import { ParseHTML } from '@components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { View } from 'react-native'

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
  return (
    <>
      {status.spoiler_text ? (
        <>
          <View style={{ marginBottom: StyleConstants.Font.Size.M }}>
            <ParseHTML
              content={status.spoiler_text}
              size={highlighted ? 'L' : 'M'}
              emojis={status.emojis}
              mentions={status.mentions}
              tags={status.tags}
              numberOfLines={999}
            />
          </View>
          <ParseHTML
            content={status.content}
            size={highlighted ? 'L' : 'M'}
            emojis={status.emojis}
            mentions={status.mentions}
            tags={status.tags}
            numberOfLines={0}
            expandHint='隐藏内容'
          />
        </>
      ) : (
        <ParseHTML
          content={status.content}
          size={highlighted ? 'L' : 'M'}
          emojis={status.emojis}
          mentions={status.mentions}
          tags={status.tags}
          numberOfLines={numberOfLines}
        />
      )}
    </>
  )
}

export default React.memo(TimelineContent, () => true)
