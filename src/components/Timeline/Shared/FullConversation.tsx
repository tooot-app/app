import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'

export interface Props {
  queryKey?: QueryKeyTimeline
  status: Mastodon.Status
}

const TimelineFullConversation = React.memo(
  ({ queryKey, status }: Props) => {
    const { t } = useTranslation('componentTimeline')
    const { theme } = useTheme()

    return queryKey &&
      queryKey[1].page !== 'Toot' &&
      status.in_reply_to_account_id &&
      (status.mentions.length === 0 ||
        status.mentions.filter(
          mention => mention.id !== status.in_reply_to_account_id
        ).length) ? (
      <Text
        style={{
          ...StyleConstants.FontStyle.M,
          color: theme.blue,
          marginTop: StyleConstants.Font.Size.M / 2
        }}
      >
        {t('shared.fullConversation')}
      </Text>
    ) : null
  },
  () => true
)

export default TimelineFullConversation
