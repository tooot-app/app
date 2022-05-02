import { ParseHTML } from '@components/Parse'
import { getInstanceAccount } from '@utils/slices/instancesSlice'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

export interface Props {
  status: Pick<
    Mastodon.Status,
    'content' | 'spoiler_text' | 'emojis' | 'mentions' | 'tags'
  >
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
    const instanceAccount = useSelector(getInstanceAccount, () => true)

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
              numberOfLines={
                instanceAccount.preferences['reading:expand:spoilers'] ? 999 : 1
              }
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
  (prev, next) =>
    prev.status.content === next.status.content &&
    prev.status.spoiler_text === next.status.spoiler_text
)

export default TimelineContent
