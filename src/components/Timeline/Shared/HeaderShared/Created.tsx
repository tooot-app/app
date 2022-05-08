import Icon from '@components/Icon'
import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FormattedDate, FormattedRelativeTime, FormattedTime } from 'react-intl'

export interface Props {
  created_at: Mastodon.Status['created_at'] | number
  edited_at?: Mastodon.Status['edited_at']
  highlighted?: boolean
}

const HeaderSharedCreated = React.memo(
  ({ created_at, edited_at, highlighted = false }: Props) => {
    const { t } = useTranslation('componentTimeline')
    const { colors } = useTheme()

    const actualTime = edited_at || created_at

    return (
      <>
        <CustomText fontStyle='S' style={{ color: colors.secondary }}>
          {highlighted ? (
            <>
              <FormattedDate
                value={new Date(actualTime)}
                dateStyle='medium'
                timeStyle='short'
              />
            </>
          ) : (
            <FormattedRelativeTime
              value={
                -(new Date().getTime() - new Date(actualTime).getTime()) / 1000
              }
              updateIntervalInSeconds={1}
            />
          )}
        </CustomText>
        {edited_at ? (
          <Icon
            accessibilityLabel={t(
              'shared.header.shared.edited.accessibilityLabel'
            )}
            name='Edit'
            size={StyleConstants.Font.Size.S}
            color={colors.secondary}
            style={{ marginLeft: StyleConstants.Spacing.S }}
          />
        ) : null}
      </>
    )
  },
  (prev, next) => prev.edited_at === next.edited_at
)

export default HeaderSharedCreated
