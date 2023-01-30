import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import StatusContext from './Context'

const TimelineFullConversation = () => {
  const { queryKey, status, disableDetails } = useContext(StatusContext)
  if (!status || disableDetails) return null

  const { t } = useTranslation('componentTimeline')
  const { colors } = useTheme()

  return queryKey &&
    queryKey[1].page !== 'Toot' &&
    status.in_reply_to_account_id &&
    (status.mentions?.length === 0 ||
      status.mentions?.filter(mention => mention.id !== status.in_reply_to_account_id).length) ? (
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
}

export default TimelineFullConversation
