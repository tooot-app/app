import { ParseHTML } from '@components/Parse'
import { getInstanceAccount } from '@utils/slices/instancesSlice'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import StatusContext from './Context'

export interface Props {
  setSpoilerExpanded?: React.Dispatch<React.SetStateAction<boolean>>
}

const TimelineContent: React.FC<Props> = ({ setSpoilerExpanded }) => {
  const { status, highlighted, disableDetails } = useContext(StatusContext)
  if (!status || typeof status.content !== 'string' || !status.content.length) return null

  const { t } = useTranslation('componentTimeline')
  const instanceAccount = useSelector(getInstanceAccount, () => true)

  return (
    <>
      {status.spoiler_text?.length ? (
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
          />
          <ParseHTML
            content={status.content}
            size={highlighted ? 'L' : 'M'}
            adaptiveSize
            emojis={status.emojis}
            mentions={status.mentions}
            tags={status.tags}
            numberOfLines={instanceAccount.preferences['reading:expand:spoilers'] ? 999 : 1}
            expandHint={t('shared.content.expandHint')}
            setSpoilerExpanded={setSpoilerExpanded}
            highlighted={highlighted}
            disableDetails={disableDetails}
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
          numberOfLines={highlighted ? 999 : undefined}
          disableDetails={disableDetails}
        />
      )}
    </>
  )
}

export default TimelineContent
