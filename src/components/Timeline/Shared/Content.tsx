import { ParseHTML } from '@components/Parse'
import React from 'react'
import { useTranslation } from 'react-i18next'

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
            <ParseHTML
              content={status.spoiler_text}
              size={highlighted ? 'L' : 'M'}
              adaptiveSize
              emojis={status.emojis}
              mentions={status.mentions}
              tags={status.tags}
              numberOfLines={999}
              highlighted={highlighted}
              disableDetails={disableDetails}
              selectable={highlighted}
            />
            <ParseHTML
              content={status.content}
              size={highlighted ? 'L' : 'M'}
              adaptiveSize
              emojis={status.emojis}
              mentions={status.mentions}
              tags={status.tags}
              numberOfLines={1}
              expandHint={t('shared.content.expandHint')}
              highlighted={highlighted}
              disableDetails={disableDetails}
              selectable={highlighted}
            />
          </>
        ) : (
          <ParseHTML
            content={status.content}
            size={highlighted ? 'L' : 'M'}
            adaptiveSize
            emojis={status.emojis}
            mentions={status.mentions}
            tags={status.tags}
            numberOfLines={highlighted ? 999 : numberOfLines}
            disableDetails={disableDetails}
            selectable={highlighted}
          />
        )}
      </>
    )
  },
  () => true
)

export default TimelineContent
