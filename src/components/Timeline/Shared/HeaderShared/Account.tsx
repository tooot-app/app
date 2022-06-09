import CustomText from '@components/Text'
import { ParseEmojis } from '@root/components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

export interface Props {
  account: Mastodon.Account
  withoutName?: boolean // For notification follow request etc.
}

const HeaderSharedAccount = React.memo(
  ({ account, withoutName = false }: Props) => {
    const { t } = useTranslation('componentTimeline')
    const { colors } = useTheme()

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {withoutName ? null : (
          <CustomText
            accessibilityHint={t(
              'shared.header.shared.account.name.accessibilityHint'
            )}
            style={{ marginRight: StyleConstants.Spacing.XS }}
            numberOfLines={1}
          >
            <ParseEmojis
              content={account?.display_name || account?.username}
              emojis={account.emojis}
              fontBold
            />
          </CustomText>
        )}
        <CustomText
          accessibilityHint={t(
            'shared.header.shared.account.account.accessibilityHint'
          )}
          style={{ flexShrink: 1, color: colors.secondary }}
          numberOfLines={1}
        >
          @{account.acct}
        </CustomText>
      </View>
    )
  },
  () => true
)

export default HeaderSharedAccount
