import Icon from '@components/Icon'
import RelativeTime from '@components/RelativeTime'
import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { FormattedDate } from 'react-intl'
import StatusContext from '../Context'

export interface Props {
  created_at?: Mastodon.Status['created_at'] | number
}

const HeaderSharedCreated: React.FC<Props> = ({ created_at }) => {
  const { status, highlighted } = useContext(StatusContext)
  const { t } = useTranslation('componentTimeline')
  const { colors } = useTheme()

  if (!status) return null

  const actualTime = created_at || status.edited_at || status.created_at

  return (
    <>
      <CustomText fontStyle='S' style={{ color: colors.secondary }}>
        {highlighted ? (
          <>
            <FormattedDate value={new Date(actualTime)} dateStyle='medium' timeStyle='short' />
          </>
        ) : (
          <RelativeTime time={actualTime} />
        )}
      </CustomText>
      {status.edited_at && !highlighted ? (
        <Icon
          accessibilityLabel={t('shared.header.shared.edited.accessibilityLabel')}
          name='edit'
          size={StyleConstants.Font.Size.S}
          color={colors.secondary}
          style={{ marginLeft: StyleConstants.Spacing.S }}
        />
      ) : null}
    </>
  )
}

export default HeaderSharedCreated
