import Icon from '@components/Icon'
import RelativeTime from '@components/RelativeTime'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'

export interface Props {
  created_at: Mastodon.Status['created_at']
  edited_at?: Mastodon.Status['edited_at']
}

const HeaderSharedCreated = React.memo(
  ({ created_at, edited_at }: Props) => {
    const { t } = useTranslation('componentTimeline')
    const { colors } = useTheme()

    return (
      <>
        <Text
          style={{ ...StyleConstants.FontStyle.S, color: colors.secondary }}
        >
          <RelativeTime date={edited_at || created_at} />
        </Text>
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
  () => true
)

export default HeaderSharedCreated
