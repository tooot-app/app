import CustomText from '@components/Text'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'

export interface Props {
  queryKey?: QueryKeyTimeline
  status: Mastodon.Status
}

const TimelineFullConversation = React.memo(
  ({ queryKey, status }: Props) => {
    const { t } = useTranslation('componentTimeline')
    const { colors } = useTheme()

    return queryKey &&
      queryKey[1].page !== 'Toot' &&
      status.in_reply_to_account_id &&
      (status.mentions.length === 0 ||
        status.mentions.filter(
          mention => mention.id !== status.in_reply_to_account_id
        ).length) ? (
      <CustomText
        fontStyle='S'
        style={{
          color: colors.blue,
          marginTop: StyleConstants.Spacing.S
        }}
      >
        {t('shared.fullConversation')}
      </CustomText>
    ) : null
  },
  () => true
)

export default TimelineFullConversation
