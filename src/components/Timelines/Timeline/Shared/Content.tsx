import React from 'react'
import { View } from 'react-native'
import ParseContent from '@components/ParseContent'
import { StyleConstants } from '@utils/styles/constants'

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
          <ParseContent
            content={status.spoiler_text}
            size={highlighted ? 'L' : 'M'}
            emojis={status.emojis}
            numberOfLines={999}
          />
          <View style={{ marginTop: StyleConstants.Font.Size.M }}>
            <ParseContent
              content={status.content}
              size={highlighted ? 'L' : 'M'}
              emojis={status.emojis}
              mentions={status.mentions}
              numberOfLines={1}
              expandHint='隐藏内容'
            />
          </View>
        </>
      ) : (
        <ParseContent
          content={status.content}
          size={highlighted ? 'L' : 'M'}
          emojis={status.emojis}
          mentions={status.mentions}
          numberOfLines={numberOfLines}
        />
      )}
    </>
  )
}

export default React.memo(TimelineContent, () => true)
