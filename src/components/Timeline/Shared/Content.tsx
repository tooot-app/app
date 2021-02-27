import { ParseHTML } from '@components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

export interface Props {
  status: Mastodon.Status
  numberOfLines?: number
  highlighted?: boolean
  disableDetails?: boolean
}

const TimelineContent = React.memo(
  ({
    status,
    numberOfLines,
    highlighted = false,
    disableDetails = false
  }: Props) => {
    const { t } = useTranslation('componentTimeline')

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
                disableDetails={disableDetails}
              />
            </View>
            <ParseHTML
              content={status.content}
              size={highlighted ? 'L' : 'M'}
              emojis={status.emojis}
              mentions={status.mentions}
              tags={status.tags}
              numberOfLines={0}
              expandHint={t('shared.content.expandHint')}
              disableDetails={disableDetails}
            />
          </>
        ) : (
          <ParseHTML
            content={status.content}
            size={highlighted ? 'L' : 'M'}
            emojis={status.emojis}
            mentions={status.mentions}
            tags={status.tags}
            numberOfLines={highlighted ? 999 : numberOfLines}
            disableDetails={disableDetails}
          />
        )}
      </>
    )
  },
  () => true
)

export default TimelineContent
