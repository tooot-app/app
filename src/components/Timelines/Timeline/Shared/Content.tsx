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

const TimelineContent: React.FC<Props> = ({
  status,
  numberOfLines,
  highlighted = false,
  disableDetails = false
}) => {
  const { t } = useTranslation('timeline')

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
          numberOfLines={numberOfLines}
          disableDetails={disableDetails}
        />
      )}
    </>
  )
}

export default React.memo(TimelineContent, () => true)
